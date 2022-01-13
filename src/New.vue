<template>
  <div class="map" ref="map">
    <div class="mapBox" ref="mapBox" @mousedown="onMousedown"></div>
    <div class="center">{{ this.center[0] + ',' + this.center[1] }}</div>
    <div class="line lineX"></div>
    <div class="line lineY"></div>
  </div>
</template>

<script>
import { animate } from 'popmotion'
import Konva from 'konva'
import {
  getTileUrl,
  TILE_SIZE,
  getTileRowAndCol,
  lngLat2Mercator,
  getPxFromLngLat,
  resolutions,
  mercatorToLngLat,
} from './utils'

// 瓦片类
class Tile {
  constructor({ layer, row, col, zoom, x, y, shouldRender }) {
    // 瓦片显示图层
    this.layer = layer
    // 瓦片行列号
    this.row = row
    this.col = col
    // 瓦片层级
    this.zoom = zoom
    // 显示位置
    this.x = x
    this.y = y
    // 判断瓦片是否应该渲染
    this.shouldRender = shouldRender
    // 瓦片url
    this.url = ''
    // 缓存key
    this.cacheKey = this.row + '_' + this.col + '_' + this.zoom
    // 瓦片图片
    this.img = null
    // 瓦片透明度
    this.opacity = 0
    // 图片是否加载完成
    this.loaded = false
    // 图片加载超时定时器
    this.timer = null
    // 瓦片渐现过渡时间
    this.fadeInDuration = 500

    this.createUrl()
    this.load()
  }

  // 生成url
  createUrl() {
    this.url = getTileUrl(this.row, this.col, this.zoom)
  }

  // 加载图片
  load() {
    let img = new Image()
    img.src = this.url
    // 加载超时，重新加载
    this.timer = setTimeout(() => {
      this.createUrl()
      this.load()
    }, 1000)
    // 加载完成
    img.onload = () => {
      clearTimeout(this.timer)
      // 创建图片元素
      this.img = new Konva.Image({
        image: img,
        width: TILE_SIZE,
        height: TILE_SIZE,
        opacity: this.opacity,
      })
      this.loaded = true
      this.render()
    }
  }

  // 渲染
  render(isFadeIn = false) {
    if (!this.loaded || !this.shouldRender(this.cacheKey)) {
      return
    }
    // 添加到图层
    this.layer.add(this.img)
    // 设置显示位置
    this.img.x(this.x).y(this.y)
    // 需要渐现
    if (isFadeIn && this.opacity !== 0) {
      this.opacity = 0
      this.img.opacity(0)
    }
    this.fadeIn()
  }

  // 渐现
  fadeIn() {
    if (this.opacity >= 1) {
      return
    }
    let base = this.opacity
    let anim = new Konva.Animation((frame) => {
      let opacity = (frame.time / this.fadeInDuration) * 1 + base
      this.opacity = opacity
      this.img.opacity(opacity)
      if (opacity >= 1) {
        anim.stop()
      }
    }, this.layer)
    anim.start()
  }

  // 更新要添加到的图层
  updateLayer(layer) {
    this.layer = layer
    return this
  }

  // 更新位置
  updatePos(x, y) {
    this.x = x
    this.y = y
    return this
  }
}

export default {
  name: 'App',
  data() {
    return {
      // 画布宽高
      width: 0,
      height: 0,
      // 画布需要的瓦片数量
      rowCount: 0,
      colCount: 0,
      halfRowCount: 0,
      halfColCount: 0,
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
      // 缩放相关
      lastZoom: 0,
      scale: 1,
      scaleTmp: 1,
      playback: null,
      // 图层相关
      stage: null,
      layer1: null,
      layer2: null,
      useLayer1: true,
    }
  },
  mounted() {
    this.init()
    this.getCount()
    this.renderTiles()
    window.addEventListener('mousemove', this.onMousemove)
    window.addEventListener('mouseup', this.onMouseup)
    window.addEventListener('wheel', this.onMousewheel)
  },
  beforeUnmount() {
    window.removeEventListener('mousemove', this.onMousemove)
    window.removeEventListener('mouseup', this.onMouseup)
    window.removeEventListener('wheel', this.onMousewheel)
  },
  methods: {
    // 初始化
    init() {
      // 获取容器宽高
      let { width, height } = this.$refs.mapBox.getBoundingClientRect()
      this.width = width
      this.height = height

      // 创建舞台
      this.stage = new Konva.Stage({
        container: this.$refs.mapBox,
        width,
        height,
      })

      // 创建两个图层
      this.layer1 = new Konva.Layer()
      this.layer1.x(this.width / 2).y(this.height / 2)
      this.stage.add(this.layer1)

      this.layer2 = new Konva.Layer()
      this.layer2.x(this.width / 2).y(this.height / 2)
      this.stage.add(this.layer2)
    },

    // 计算需要的瓦片数量
    getCount() {
      let paddingCount = 2
      // 水平方向需要的瓦片数量
      this.rowCount = Math.ceil(this.width / TILE_SIZE) + paddingCount
      // 垂直方向需要的瓦片数量
      this.colCount = Math.ceil(this.height / TILE_SIZE) + paddingCount
      // 瓦片数量的一半
      this.halfRowCount = Math.ceil(this.rowCount / 2)
      this.halfColCount = Math.ceil(this.colCount / 2)
    },

    // 计算显示范围内的瓦片行列号
    renderTiles(isFadeIn = false) {
      // 中心点对应的瓦片
      let centerTile = getTileRowAndCol(
        ...lngLat2Mercator(...this.center),
        this.zoom
      )
      // 中心瓦片左上角对应的像素坐标
      let centerTilePos = [centerTile[0] * TILE_SIZE, centerTile[1] * TILE_SIZE]
      // 中心点对应的像素坐标
      let centerPos = getPxFromLngLat(...this.center, this.zoom)
      // 中心瓦片左上角距中心像素坐标的差值
      let offset = [
        centerTilePos[0] - centerPos[0],
        centerTilePos[1] - centerPos[1],
      ]

      // 中心瓦片的索引
      let centerTileIndex = [this.halfRowCount, this.halfColCount]

      // 渲染画布内所有瓦片
      this.currentTileCache = {} // 清空缓存对象
      for (let i = 0; i < this.rowCount; i++) {
        for (let j = 0; j < this.colCount; j++) {
          // 当前瓦片和中心瓦片的索引差值
          let offsetIndex = [centerTileIndex[0] - i, centerTileIndex[1] - j]
          // 当前瓦片的行列号
          let row = centerTile[0] + offsetIndex[0]
          let col = centerTile[1] + offsetIndex[1]
          // 当前瓦片的显示位置
          let x = offset[0] + offsetIndex[0] * TILE_SIZE
          let y = offset[1] + offsetIndex[1] * TILE_SIZE
          // 缓存key
          let cacheKey = row + '_' + col + '_' + this.zoom
          // 记录当前需要的瓦片
          this.currentTileCache[cacheKey] = true
          // 该瓦片已加载过
          let layer = this.useLayer1 ? this.layer1 : this.layer2
          if (this.tileCache[cacheKey]) {
            this.tileCache[cacheKey]
              .updateLayer(layer)
              .updatePos(x, y)
              .render(isFadeIn)
          } else {
            // 未加载过
            this.tileCache[cacheKey] = new Tile({
              layer,
              row,
              col,
              zoom: this.zoom,
              x,
              y,
              // 判断瓦片是否在当前画布缓存对象上，是的话则代表需要渲染
              shouldRender: (key) => {
                return this.currentTileCache[key]
              },
            })
          }
        }
      }
    },

    // 清空图层
    clearLayer() {
      this.layer1.removeChildren()
      this.layer2.removeChildren()
    },

    // 重置图层
    resetLayer() {
      // 如果当前元素显示在图层1，那么即将切换为图层2，所以将图层二的缩放复位、清空旧的元素、置顶显示，反之亦然
      let currentLayer = this.useLayer1 ? this.layer1 : this.layer2
      let willLayer = this.useLayer1 ? this.layer2 : this.layer1
      willLayer.scale({
        x: 1,
        y: 1,
      })
      willLayer.removeChildren()
      currentLayer.zIndex(0)
      willLayer.zIndex(1)
    },

    // 鼠标按下
    onMousedown(e) {
      if (e.which === 1) {
        this.isMousedown = true
      }
    },

    // 鼠标移动
    onMousemove(e) {
      if (!this.isMousedown) {
        return
      }
      // 计算本次拖动的距离对应的经纬度数据
      let mx = e.movementX * resolutions[this.zoom]
      let my = e.movementY * resolutions[this.zoom]
      let [x, y] = lngLat2Mercator(...this.center)
      // 更新拖动后的中心点经纬度
      this.center = mercatorToLngLat(x - mx, my + y)
      // 清除画布重新渲染瓦片
      this.clearLayer()
      this.renderTiles()
    },

    // 鼠标松开
    onMouseup() {
      this.isMousedown = false
    },

    // 鼠标滚动
    onMousewheel(e) {
      if (e.deltaY > 0) {
        // 层级变小
        if (this.zoom > this.minZoom) this.zoom--
      } else {
        // 层级变大
        if (this.zoom < this.maxZoom) this.zoom++
      }
      // 层级未发生改变
      if (this.lastZoom === this.zoom) {
        return
      }
      this.lastZoom = this.zoom
      // 更新缩放比例，也就是目标缩放值
      this.scale *= e.deltaY > 0 ? 0.5 : 2
      // 停止上一次动画
      if (this.playback) {
        this.playback.stop()
      }
      // 图层重置
      this.resetLayer()
      // 开启动画
      this.playback = animate({
        from: this.scaleTmp, // 当前缩放值
        to: this.scale, // 目标缩放值
        onUpdate: (latest) => {
          // 实时更新当前缩放值
          this.scaleTmp = latest
          let layer = this.useLayer1 ? this.layer1 : this.layer2
          layer.scale({
            x: latest,
            y: latest,
          })
        },
        onComplete: () => {
          // 切换图层
          this.useLayer1 = !this.useLayer1
          // 动画完成后将缩放值重置为1
          this.scale = 1
          this.scaleTmp = 1
          // 根据最终缩放值重新计算需要的瓦片并渲染
          this.renderTiles(true)
        },
      })
    },
  },
}
</script>

<style scoped>
.map {
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}

.mapBox {
  width: 100%;
  height: 100%;
}

.line {
  position: absolute;
  background-color: #000;
}

.lineX {
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
}

.lineY {
  left: 50%;
  top: 0;
  height: 100%;
  width: 1px;
}

.center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%);
}
</style>
