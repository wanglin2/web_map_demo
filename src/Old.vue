<template>
  <div class="map" ref="map">
    <canvas ref="canvas" @mousedown="onMousedown"></canvas>
    <div class="center">{{ this.center[0] + "," + this.center[1] }}</div>
    <div class="line lineX"></div>
    <div class="line lineY"></div>
  </div>
</template>

<script>
import { animate } from "popmotion";
import {
  getTileUrl,
  TILE_SIZE,
  getTileRowAndCol,
  lngLatToMercator,
  getPxFromLngLat,
  resolutions,
  mercatorToLngLat,
} from "./utils";

// 瓦片类
class Tile {
  constructor({ ctx, row, col, zoom, x, y, shouldRender }) {
    // 画布上下文
    this.ctx = ctx;
    // 瓦片行列号
    this.row = row;
    this.col = col;
    // 瓦片层级
    this.zoom = zoom;
    // 显示位置
    this.x = x;
    this.y = y;
    // 判断瓦片是否应该渲染
    this.shouldRender = shouldRender;
    // 瓦片url
    this.url = "";
    // 缓存key
    this.cacheKey = this.row + "_" + this.col + "_" + this.zoom;
    // 图片
    this.img = null;
    // 图片是否加载完成
    this.loaded = false;
    // 图片加载超时定时器
    this.timer = null;

    this.createUrl();
    this.load();
  }

  // 生成url
  createUrl() {
    this.url = getTileUrl(this.row, this.col, this.zoom);
  }

  // 加载图片
  load() {
    this.img = new Image();
    this.img.src = this.url;
    // 加载超时，重新加载
    this.timer = setTimeout(() => {
      this.createUrl();
      this.load();
    }, 1000);
    this.img.onload = () => {
      clearTimeout(this.timer);
      this.loaded = true;
      this.render();
    };
  }

  // 将图片渲染到canvas上
  render() {
    if (!this.loaded || !this.shouldRender(this.cacheKey)) {
      return;
    }
    this.ctx.drawImage(this.img, this.x, this.y);
  }

  // 更新位置
  updatePos(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
}

export default {
  name: "App",
  data() {
    return {
      // 画布宽高
      width: 0,
      height: 0,
      // 鼠标按下标志
      isMousedown: false,
      // 缓存瓦片实例
      tileCache: {},
      // 记录当前画布上需要的瓦片
      currentTileCache: {},
      // 初始中心经纬度
      center: [120.148732, 30.231006], // 雷锋塔
      // 初始缩放层级
      zoom: 17,

      // 缩放层级范围
      minZoom: 3,
      maxZoom: 18,
      // canvas绘图上下文
      ctx: null,
      // 缩放相关
      lastZoom: 0,
      scale: 1,
      scaleTmp: 1,
      playback: null,
    };
  },
  mounted() {
    this.initCanvas();
    this.renderTiles();
    window.addEventListener("mousemove", this.onMousemove);
    window.addEventListener("mouseup", this.onMouseup);
    window.addEventListener("wheel", this.onMousewheel);
  },
  beforeUnmount() {
    window.removeEventListener("mousemove", this.onMousemove);
    window.removeEventListener("mouseup", this.onMouseup);
    window.removeEventListener("wheel", this.onMousewheel);
  },
  methods: {
    // 初始化画布
    initCanvas() {
      // 获取容器宽高
      let { width, height } = this.$refs.map.getBoundingClientRect();
      this.width = width;
      this.height = height;
      // 设置画布宽高
      let canvas = this.$refs.canvas;
      canvas.width = this.width;
      canvas.height = this.height;
      this.ctx = canvas.getContext("2d");
      // 移动画布原点
      this.ctx.translate(this.width / 2, this.height / 2);
    },

    // 计算显示范围内的瓦片行列号
    renderTiles() {
      // 中心点对应的瓦片
      let centerTile = getTileRowAndCol(
        ...lngLatToMercator(...this.center),
        this.zoom
      );
      // 中心瓦片左上角对应的像素坐标
      let centerTilePos = [
        centerTile[0] * TILE_SIZE,
        centerTile[1] * TILE_SIZE,
      ];
      // 中心点对应的像素坐标
      let centerPos = getPxFromLngLat(...this.center, this.zoom);
      // 中心像素坐标距中心瓦片左上角的差值
      let offset = [
        centerPos[0] - centerTilePos[0],
        centerPos[1] - centerTilePos[1],
      ];
      // 计算瓦片数量
      let rowMinNum = Math.ceil((this.width / 2 - offset[0]) / TILE_SIZE);
      let colMinNum = Math.ceil((this.height / 2 - offset[1]) / TILE_SIZE);
      let rowMaxNum = Math.ceil(
        (this.width / 2 - (TILE_SIZE - offset[0])) / TILE_SIZE
      );
      let colMaxNum = Math.ceil(
        (this.height / 2 - (TILE_SIZE - offset[1])) / TILE_SIZE
      );
      // 渲染画布内所有瓦片
      this.currentTileCache = {}; // 清空缓存对象
      for (let i = -rowMinNum; i <= rowMaxNum; i++) {
        for (let j = -colMinNum; j <= colMaxNum; j++) {
          // 当前瓦片的行列号
          let row = centerTile[0] + i;
          let col = centerTile[1] + j;
          // 当前瓦片的显示位置
          let x = i * TILE_SIZE - offset[0];
          let y = j * TILE_SIZE - offset[1];
          // 缓存key
          let cacheKey = row + "_" + col + "_" + this.zoom;
          // 记录当前需要的瓦片
          this.currentTileCache[cacheKey] = true;
          // 该瓦片已加载过
          if (this.tileCache[cacheKey]) {
            this.tileCache[cacheKey].updatePos(x, y).render();
          } else {
            // 未加载过
            this.tileCache[cacheKey] = new Tile({
              ctx: this.ctx,
              row,
              col,
              zoom: this.zoom,
              x,
              y,
              // 判断瓦片是否在当前画布缓存对象上，是的话则代表需要渲染
              shouldRender: (key) => {
                return this.currentTileCache[key];
              },
            });
          }
        }
      }
    },

    // 清除画布
    clear() {
      this.ctx.clearRect(
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    },

    // 鼠标按下
    onMousedown(e) {
      if (e.which === 1) {
        this.isMousedown = true;
      }
    },

    // 鼠标移动
    onMousemove(e) {
      if (!this.isMousedown) {
        return;
      }
      // 计算本次拖动的距离对应的经纬度数据
      let mx = e.movementX * resolutions[this.zoom];
      let my = e.movementY * resolutions[this.zoom];
      let [x, y] = lngLatToMercator(...this.center);
      // 更新拖动后的中心点经纬度
      this.center = mercatorToLngLat(x - mx, my + y);
      // 清除画布重新渲染瓦片
      this.clear();
      this.renderTiles();
    },

    // 鼠标松开
    onMouseup() {
      this.isMousedown = false;
    },

    // 鼠标滚动
    onMousewheel(e) {
      if (e.deltaY > 0) {
        // 层级变小
        if (this.zoom > this.minZoom) this.zoom--;
      } else {
        // 层级变大
        if (this.zoom < this.maxZoom) this.zoom++;
      }
      // 层级未发生改变
      if (this.lastZoom === this.zoom) {
        return;
      }
      this.lastZoom = this.zoom;
      // 更新缩放比例，也就是目标缩放值
      this.scale *= e.deltaY > 0 ? 0.5 : 2;
      // 停止上一次动画
      if (this.playback) {
        this.playback.stop();
      }
      // 开启动画
      this.playback = animate({
        from: this.scaleTmp, // 当前缩放值
        to: this.scale, // 目标缩放值
        onUpdate: (latest) => {
          // 实时更新当前缩放值
          this.scaleTmp = latest;
          // 保存画布之前状态，原因有二：
          // 1.scale方法是会在之前的状态上叠加的，比如初始是1，第一次执行scale(2,2)，第二次执行scale(3,3)，最终缩放值不是3，而是6，所以每次缩放完就恢复状态，那么就相当于每次都是从初始值1开始缩放，效果就对了
          // 2.保证缩放效果只对重新渲染已有瓦片生效，不会对最后的renderTiles()造成影响
          this.ctx.save();
          this.clear();
          this.ctx.scale(latest, latest);
          // 刷新当前画布上的瓦片
          Object.keys(this.currentTileCache).forEach((tile) => {
            this.tileCache[tile].render();
          });
          // 恢复到画布之前状态
          this.ctx.restore();
        },
        onComplete: () => {
          // 动画完成后将缩放值重置为1
          this.scale = 1;
          this.scaleTmp = 1;
          // 根据最终缩放值重新计算需要的瓦片并渲染
          this.renderTiles();
        },
      });
    },
  },
};
</script>

<style scoped>
.map {
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}

.line {
  position: absolute;
  background-color: #000;
}

.lineX {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 2px;
}

.lineY {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 50px;
  width: 2px;
}

.center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%);
}
</style>