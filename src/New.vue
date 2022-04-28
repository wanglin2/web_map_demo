<template>
  <div class="map" ref="map">
    <div class="mapBox" ref="mapBox" @mousedown="onMousedown"></div>
    <!-- 中心点十字架 -->
    <div class="line lineX"></div>
    <div class="line lineY"></div>
    <!-- 搜索框 -->
    <div class="searchBox">
      <div class="searchInput">
        <input
          type="text"
          placeholder="搜索..."
          v-model="searchText"
          @input="onSearch"
          @keyup.enter="onSearch"
          @click.stop
        />
      </div>
      <div class="searchList">
        <div
          class="searchItem"
          v-for="(item, index) in searchResultList"
          :key="index"
          @click="go(item.location)"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
    <div class="mapTypeSelectBox">
      <select v-model="selectMapType" @change="onSelectMapTypeChange">
        <option v-for="item in mapList" :key="item.value" :value="item.value">{{item.name}}</option>
      </select>
    </div>
    <!-- 经纬度框 -->
    <div class="posInput">
      <input
        type="text"
        placeholder="经纬度..."
        v-model="posValue"
        @keyup.enter="onChangePos"
        @click.stop
      />
    </div>
    <!-- 返回到初始中心点按钮 -->
    <div class="backCenterBtn" @click.stop="backCenter"></div>
    <!-- 放大缩小按钮 -->
    <div class="scaleBtnBox">
      <div
        class="scaleBtn in"
        :class="{ disabled: zoom >= maxZoom }"
        @click.stop="zoomIn"
      ></div>
      <div
        class="scaleBtn out"
        :class="{ disabled: zoom <= minZoom }"
        @click.stop="zoomOut"
      ></div>
    </div>
    <!-- 叠加物 -->
    <img class="overlay" src="./assets/camera.png" :style="{left: overlayPos.x + 'px', top: overlayPos.y + 'px'}" alt="">
  </div>
</template>

<script>
import { animate, easeOut } from "popmotion";
import Konva from "konva";
import {
  getTileUrlPro,
  TILE_SIZE,
  getTileRowAndCol,
  lngLatToMercator,
  getPxFromLngLat,
  resolutions,
  mercatorToLngLat,
  KEY,
  getRandomDomainIndex
} from "./utils";
import gcoord from 'gcoord';

// 图片加载类
class Img {
  constructor(url, onload) {
    this.timer = null;
    this.url = url;
    this.onload = onload;
    this.called = false
    this.reloadTimes = 0;
    this.load();
  }

  load() {
    if (this.reloadTimes >= 5) {
      if (!this.called) {
        this.onload(null);
        this.called = true
      }
      return
    }
    this.reloadTimes++
    let img = new Image();
    img.src = this.url;
    // 加载超时，重新加载
    this.timer = setTimeout(() => {
      this.load();
    }, 1000);
    // 加载完成
    img.onload = () => {
      clearTimeout(this.timer);
      if (!this.called) {
        this.onload(img);
        this.called = true
      }
    };
    img.onerror = () => {
      this.load();
    }
  }
}

// 瓦片类
class Tile {
  constructor({ layer, row, col, zoom, x, y, shouldRender, getMapTypeData }) {
    // 瓦片显示图层
    this.layer = layer;
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
    // 获取当前地图类型数据
    this.getMapTypeData = getMapTypeData;
    // 瓦片url
    this.urls = [];
    // 缓存key
    this.cacheKey = this.row + "_" + this.col + "_" + this.zoom;
    // 瓦片图片
    this.imgs = [];
    // 瓦片透明度
    this.opacity = 0;
    // 图片是否加载完成
    this.loaded = false;
    // 图片加载超时定时器
    this.timer = null;
    // 瓦片渐现过渡时间
    this.fadeInDuration = 400;

    this.createUrl();
    this.load();
  }

  // 生成url
  createUrl() {
    let mapData = this.getMapTypeData()
    this.urls = mapData.urls.map((url) => {
      return getTileUrlPro(this.row, this.col, this.zoom, url, {getTileUrl: mapData.getTileUrl, transformXYZ: mapData.transformXYZ})
    });
  }

  // 加载图片
  load() {
    let tasks = this.urls.map((url, index) => {
      return new Promise((resolve) => {
        new Img(url, (img) => {
          if (img) {
            this.imgs[index] = new Konva.Image({
              image: img,
              width: TILE_SIZE,
              height: TILE_SIZE,
              opacity: this.opacity,
            })
          }
          resolve()
        })
      })
    })
    Promise.all(tasks)
      .then(() => {
        this.loaded = true
        this.render()
      })
  }

  // 渲染
  render(isFadeIn = false) {
    if (!this.loaded || this.imgs.length <= 0 || !this.shouldRender(this.cacheKey)) {
      return;
    }
    // 添加到图层
    this.imgs.forEach((img) => {
      if (img) {
        this.layer.add(img);
        // 设置显示位置
        img.x(this.x).y(this.y);
      }
    });
    // 需要渐现
    if (isFadeIn && this.opacity !== 0) {
      this.hide();
    }
    this.fadeIn();
  }

  // 渐现
  fadeIn() {
    if (this.opacity >= 1 || this.imgs.length <= 0) {
      return;
    }
    let base = this.opacity;
    let anim = new Konva.Animation((frame) => {
      let opacity = (frame.time / this.fadeInDuration) * 1 + base;
      this.opacity = opacity;
      this.imgs.forEach((img) => {
        if (img) {
          img.opacity(opacity);
        }
      });
      if (opacity >= 1) {
        anim.stop();
      }
    }, this.layer);
    anim.start();
  }

  // 隐藏
  hide() {
    if (this.imgs.length <= 0) {
      return
    }
    this.opacity = 0;
    this.imgs.forEach((img) => {
      if (img) {
        img.opacity(0);
      }
    });
  }

  // 更新要添加到的图层
  updateLayer(layer) {
    this.layer = layer;
    return this;
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
      lastMouseTime: null,
      lastDuration: 0,
      lastDistance: [],
      // 缓存瓦片实例
      tileCache: {},
      // 记录当前画布上需要的瓦片
      currentTileCache: {},
      // 初始中心经纬度
      initCenter: [120.148732, 30.231006], // 雷锋塔
      center: [120.148732, 30.231006], // 雷锋塔
      // 初始缩放层级
      zoom: 14,
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
      // 搜索&移动
      searchText: "",
      searchTimer: null,
      searchResultList: [],
      translate: [0, 0],
      translateTmp: [0, 0],
      translatePlayback: null,
      // 经纬度框
      posValue: "",
      // 地图类型
      selectMapType: '',
      selectMapData: null,
      mapList: [
        {
          name: '高德地图',
          value: 'gaode',
          urls: ['https://webrd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8'],
        },
        {
          name: '高德影像图',
          value: 'gaodeImage',
          urls: ['https://webst0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&style=6', 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=8&x={x}&y={y}&z={z}&scl=1&ltype=4']
        },
        {
          name: '百度地图',
          value: 'baidu',
          urls: ['https://maponline2.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=2&udt=&from=jsapi2_0'],
          origin: 'center',// 坐标系原点
          axis: ['right', 'top'],// 坐标轴方向
          resolutions: function(){// 自定义分辨率
            let resolutions = [];
            for (let i = 0; i <= 18; i++) {
                resolutions[i] = Math.pow(2, 18 - i);
            }
            return resolutions
          }(),
          // 自定义经纬度和墨卡托坐标转换方法
          lngLatToMercator(lng, lat) {
            return gcoord.transform(
              [lng, lat],
              gcoord.GCJ02,
              gcoord.BD09MC
            )
          },
          mercatorToLngLat(lng, lat) {
            return gcoord.transform(
              [lng, lat],
              gcoord.BD09MC,
              gcoord.GCJ02
            )
          }
        },
        {
          name: '腾讯地图',
          value: 'tx',
          urls: ['https://rt{1-3}.map.gtimg.com/tile?z={z}&x={x}&y={y}&styleid=1&scene=0'],
          transformXYZ(x, y, z) {
            // 原点从左上角转换成左下角
            y = Math.pow(2, z) - y - 1
            return [x, y, z]
          }
        },
        {
          name: 'GeoQ',
          value: 'geoq',
          urls: ['http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}']
        },
        {
          name: '天地图',
          value: 'tianditu',
          urls: ['http://t{0-7}.tianditu.com/DataServer?T=vec_w&tk=2c009e76130364aaf09aa30ef0621154&x={x}&y={y}&l={z}', 'http://t3.tianditu.com/DataServer?T=cva_w&tk=2c009e76130364aaf09aa30ef0621154&x={x}&y={y}&l={z}'],
          // 需要火星坐标系转4326
          transformLngLat(lng, lat) {
            return gcoord.transform(
              [lng, lat],
              gcoord.GCJ02,
              gcoord.WGS84
            );
          }
        },
        {
          name: '必应中文',
          value: 'bing',
          urls: [''],
          getTileUrl(x, y, z) {
            let result = '', zIndex = 0
            for (; zIndex < z; zIndex++) {
                result = ((x & 1) + 2 * (y & 1)).toString() + result
                x >>= 1
                y >>= 1
            }
            let domainIndex = getRandomDomainIndex('http://dynamic.t{0-3}.tiles.ditu.live.com/comp/ch/')
            return `http://dynamic.t${domainIndex}.tiles.ditu.live.com/comp/ch/${result}?it=G,VE,BX,L,LA&mkt=zh-cn,syr&n=z&og=111&ur=CN`
          }
        },
      ],
      // 叠加物
      overlayPos: {
        x: 0,
        y: 0
      },
      startOverlayPos: {
        x: 0,
        y: 0
      },
      overlayCood: [120.1829784447035,30.243167147657232]
    };
  },
  watch: {
    center(val) {
      this.posValue = val.join(",");
    }
  },
  created() {
    this.selectMapType = this.mapList[0].value
    this.changeMapType()
  },
  async mounted() {
    this.init();
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
    // 地图类型切换事件
    onSelectMapTypeChange() {
      this.changeMapType()
      this.tileCache = {}
      this.currentTileCache = {}
      this.clearLayer()
      this.renderTiles()
    },

    // 修改地图类型
    changeMapType() {
      this.selectMapData = this.mapList.find((item) => {
        return item.value === this.selectMapType
      })
    },

    // 初始化
    init() {
      // 获取容器宽高
      let { width, height } = this.$refs.mapBox.getBoundingClientRect();
      this.width = width;
      this.height = height;

      // 创建舞台
      this.stage = new Konva.Stage({
        container: this.$refs.mapBox,
        width,
        height,
      });

      // 创建两个图层
      this.layer1 = new Konva.Layer();
      this.layer1.x(this.width / 2).y(this.height / 2);
      this.stage.add(this.layer1);

      this.layer2 = new Konva.Layer();
      this.layer2.x(this.width / 2).y(this.height / 2);
      this.stage.add(this.layer2);
    },

    // 计算显示范围内的瓦片行列号
    renderTiles(isFadeIn = false) {
      let center = this.center
      // 需要转换经纬度
      if (this.selectMapData.transformLngLat) {
        center = this.selectMapData.transformLngLat(...this.center)
      }
      // 地图自定义数据
      let plusOpt = {
        origin: this.selectMapData.origin,
        resolutions: this.selectMapData.resolutions,
        lngLatToMercator: this.selectMapData.lngLatToMercator
      }
      // 中心点对应的瓦片
      let centerTile = getTileRowAndCol(...center, this.zoom, plusOpt);
      // 中心瓦片左上角对应的像素坐标
      let centerTilePos = [
        centerTile[0] * TILE_SIZE,
        centerTile[1] * TILE_SIZE,
      ];
      // 中心点对应的像素坐标
      let centerPos = getPxFromLngLat(...center, this.zoom, plusOpt);
      // 中心像素坐标距中心瓦片左上/下角的差值
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
      // y轴向上
      let axisYIsTop = this.selectMapData.axis ? this.selectMapData.axis[1] === 'top' : false
      this.currentTileCache = {}; // 清空缓存对象
      // 渲染画布内所有瓦片
      for (let i = -rowMinNum; i <= rowMaxNum; i++) {
        for (let j = -colMinNum; j <= colMaxNum; j++) {
          // 当前瓦片的行列号
          let row = centerTile[0] + i;
          let col = centerTile[1] + j;
          // 当前瓦片的显示位置
          let _j = j
          // 百度地图，坐标系和画布坐标系y轴相反
          if (axisYIsTop && j !== 0) {
            _j = -j
          }
          let x = i * TILE_SIZE - offset[0];
          // 百度地图的offset[1]是中心点距中心瓦片左下角的距离，需要换算成左上角的y值
          let y = _j * TILE_SIZE - (axisYIsTop ? TILE_SIZE - offset[1] : offset[1]);
          // 缓存key
          let cacheKey = row + "_" + col + "_" + this.zoom;
          // 记录当前需要的瓦片
          this.currentTileCache[cacheKey] = true;
          // 该瓦片已加载过
          let layer = this.getCurrentMainLayer();
          if (this.tileCache[cacheKey]) {
            this.tileCache[cacheKey]
              .updateLayer(layer)
              .updatePos(x, y)
              .render(isFadeIn);
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
                return this.currentTileCache[key];
              },
              // 获取当前地图类型
              getMapTypeData: () => {
                return this.selectMapData
              }
            });
          }
        }
      }
      // 渲染叠加物
      this.renderOverlay();
    },

    // 显示叠加物
    renderOverlay() {
      // 中心点转换成像素坐标
      let centerPos = (this.selectMapData.lngLatToMercator || lngLatToMercator)(...this.center);
      // 叠加物转成像素坐标
      let overlayPos = (this.selectMapData.lngLatToMercator || lngLatToMercator)(...this.overlayCood);
      //叠加物距离中心点的像素差值
      let offset = [
        (overlayPos[0] - centerPos[0]) / (this.selectMapData.resolutions || resolutions)[this.zoom],
        (overlayPos[1] - centerPos[1]) / (this.selectMapData.resolutions || resolutions)[this.zoom]
      ]
      this.overlayPos.x = offset[0] + this.width / 2
      this.overlayPos.y = this.height / 2 - offset[1]
    },

    // 清空图层
    clearLayer() {
      this.layer1.removeChildren();
      this.layer2.removeChildren();
    },

    // 重置图层
    resetLayer() {
      // 如果当前元素显示在图层1，那么即将切换为图层2，所以将图层二的缩放复位、清空旧的元素、置顶显示，反之亦然
      let currentLayer = this.getCurrentMainLayer();
      let willLayer = this.useLayer1 ? this.layer2 : this.layer1;
      willLayer.scale({
        x: 1,
        y: 1,
      });
      willLayer.x(this.width / 2).y(this.height / 2);
      willLayer.removeChildren();
      currentLayer.zIndex(0);
      willLayer.zIndex(1);
      // 重置叠加物
      this.startOverlayPos = {
        x: this.overlayPos.x,
        y: this.overlayPos.y
      }
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
      // 记录本次拖动的时间段及偏移量
      let curTime = Date.now();
      if (this.lastMouseTime) {
        this.lastDuration = curTime - this.lastMouseTime;
        this.lastDistance = [e.movementX, e.movementY]
      }
      this.lastMouseTime = curTime;
      // 计算本次拖动的距离对应的经纬度数据
      let mx = e.movementX * (this.selectMapData.resolutions || resolutions)[this.zoom];
      let my = e.movementY * (this.selectMapData.resolutions || resolutions)[this.zoom];
      let [x, y] = (this.selectMapData.lngLatToMercator || lngLatToMercator)(...this.center);
      // 更新拖动后的中心点经纬度
      this.center = (this.selectMapData.mercatorToLngLat || mercatorToLngLat)(x - mx, my + y);
      // 清除画布重新渲染瓦片
      this.clearLayer();
      this.renderTiles();
    },

    // 鼠标松开
    onMouseup() {
      this.isMousedown = false;
      this.momentum();
    },

    // 检查是否需要动量动画
    momentum() {
      if (this.lastDuration <= 0) {
        this.resetTranslate();
        return
      }
      // 计算最后时刻鼠标滑动的速度
      let speedX = this.lastDistance[0] / this.lastDuration;
      let speedY = this.lastDistance[1] / this.lastDuration;
      // 小于该速度则不进行动量动画
      if (Math.abs(speedX) <= 0.3 && Math.abs(speedY) <= 0.3) {
        this.resetTranslate();
        return
      }
      this.translate = [this.translateTmp[0] + speedX / 0.005, this.translateTmp[1] + speedY / 0.005];
      this.resetLayer();
      if (this.translatePlayback) {
        this.translatePlayback.stop();
      }
      this.translatePlayback = animate({
        from: this.translateTmp.join(" "),
        to: this.translate.join(" "),
        ease: easeOut,
        duration: 300 + (Math.abs(speedX) + Math.abs(speedY))/2 * 100,
        onUpdate: (latest) => {
          this.translateTmp = this.stringValueToArray(latest);
          let layer = this.getCurrentMainLayer();
          // 画布移动
          layer
            .x(this.width / 2 + this.translateTmp[0])
            .y(this.height / 2 + this.translateTmp[1]);
          // 叠加物移动
          this.overlayPos.x = this.startOverlayPos.x + this.translateTmp[0]
          this.overlayPos.y = this.startOverlayPos.y + this.translateTmp[1]
        },
        onComplete: () => {
          // 计算本次拖动的距离对应的经纬度数据
          let mx = this.translate[0] * (this.selectMapData.resolutions || resolutions)[this.zoom];
          let my = this.translate[1] * (this.selectMapData.resolutions || resolutions)[this.zoom];
          let [x, y] = (this.selectMapData.lngLatToMercator || lngLatToMercator)(...this.center);
          // 更新拖动后的中心点经纬度
          this.center = (this.selectMapData.mercatorToLngLat || mercatorToLngLat)(x - mx, my + y);
          this.useLayer1 = !this.useLayer1;
          this.resetTranslate();
          // 当前不在画布上的瓦片透明度都恢复成0
          this.hideTiles();
          // 重新渲染瓦片
          this.renderTiles();
        },
      });
    },

    // 鼠标滚动
    onMousewheel(e) {
      if (e.deltaY > 0) {
        this.zoomOut();
      } else {
        this.zoomIn();
      }
    },

    // 放大
    zoomIn() {
      this.scaleMap(true);
    },

    // 缩小
    zoomOut() {
      this.scaleMap(false);
    },

    // 缩放
    scaleMap(zoomIn) {
      if (!zoomIn) {
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
      this.scale *= !zoomIn > 0 ? 0.5 : 2;
      // 停止上一次动画
      if (this.playback) {
        this.playback.stop();
      }
      // 图层重置
      this.resetLayer();
      // 开启动画
      this.playback = animate({
        from: this.scaleTmp, // 当前缩放值
        to: this.scale, // 目标缩放值
        duration: 500,
        onUpdate: (latest) => {
          // 实时更新当前缩放值
          this.scaleTmp = latest;
          let layer = this.getCurrentMainLayer();
          layer.scale({
            x: latest,
            y: latest,
          });
          // 叠加物移动
          // 叠加物坐标系原点在左上角，画布坐标系原点在中间，缩放是以中间为原点进行缩放，所以先把屏幕坐标转换成画布坐标，缩放完后再转回去
          let x = (this.startOverlayPos.x - this.width / 2) * latest
          let y = (this.startOverlayPos.y - this.height / 2) * latest
          this.overlayPos.x = x + this.width / 2
          this.overlayPos.y = y + this.height / 2
        },
        onComplete: () => {
          // 切换图层
          this.useLayer1 = !this.useLayer1;
          // 动画完成后将缩放值重置为1
          this.scale = 1;
          this.scaleTmp = 1;
          // 根据最终缩放值重新计算需要的瓦片并渲染
          this.renderTiles(true);
        },
      });
    },

    // 搜索
    onSearch() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        if (this.searchText.trim()) {
          fetch(
            `https://restapi.amap.com/v3/assistant/inputtips?key=${KEY}&keywords=${this.searchText.trim()}`
          )
            .then((response) => {
              return response.json();
            })
            .then((response) => {
              this.searchResultList = response.tips || [];
            });
        } else {
          this.searchResultList = [];
        }
      }, 300);
    },

    // 定位到指定位置
    go(newCenter) {
      if (this.translatePlayback) {
        return;
      }
      if (typeof newCenter === "string") {
        newCenter = newCenter.split(",").map((item) => {
          return Number(item);
        });
      }
      // 目标位置经纬度转3857坐标
      let newCenterMercator = (this.selectMapData.lngLatToMercator || lngLatToMercator)(...newCenter);
      // 当前经纬度转3857坐标
      let centerMercator = (this.selectMapData.lngLatToMercator || lngLatToMercator)(...this.center);
      // 计算两者的距离，转换成像素
      this.translate = [
        (newCenterMercator[0] - centerMercator[0]) / (this.selectMapData.resolutions || resolutions)[this.zoom],
        (newCenterMercator[1] - centerMercator[1]) / (this.selectMapData.resolutions || resolutions)[this.zoom],
      ];
      // 重置画布
      this.resetLayer();
      // 开启动画
      this.translatePlayback = animate({
        from: this.translateTmp.join(" "),
        to: this.translate.join(" "),
        duration: 1000,
        onUpdate: (latest) => {
          this.translateTmp = this.stringValueToArray(latest);
          let layer = this.getCurrentMainLayer();
          // 画布移动
          layer
            .x(this.width / 2 - this.translateTmp[0])
            .y(this.height / 2 + this.translateTmp[1]);
          // 叠加物移动
          this.overlayPos.x = this.startOverlayPos.x - this.translateTmp[0]
          this.overlayPos.y = this.startOverlayPos.y + this.translateTmp[1]
        },
        onComplete: () => {
          // 中心点更新为目标经纬度
          this.center = newCenter;
          this.useLayer1 = !this.useLayer1;
          this.resetTranslate();
          // 当前不在画布上的瓦片透明度都恢复成0
          this.hideTiles();
          // 重新渲染瓦片
          this.renderTiles();
        },
      });
    },

    // 复位滑动变量
    resetTranslate() {
      this.translatePlayback = null;
      this.translateTmp = [0, 0];
      this.translate = [0, 0];
      this.lastMouseTime = null;
      this.lastDuration = 0;
      this.lastDistance = [];
    },

    // 当前不在画布上的瓦片透明度都恢复成0
    hideTiles() {
      Object.keys(this.tileCache).forEach((cacheKey) => {
        if (!this.currentTileCache[cacheKey]) {
          this.tileCache[cacheKey].hide();
        }
      });
    },

    // 空格分隔的字符串转数字数组
    stringValueToArray(latest) {
      return latest.split(" ").map((item) => {
        return Number(item);
      });
    },

    // 获取当前的主画布图层
    getCurrentMainLayer() {
      return this.useLayer1 ? this.layer1 : this.layer2;
    },

    // 回到初始位置
    backCenter() {
      this.go(this.initCenter);
    },

    // 切换经纬度
    onChangePos() {
      this.go(this.posValue);
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
  background-color: rgb(244, 244, 244);
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTI0RTg4NzlGRDk5MTFFNjlDNTFBODNCMUQwNzgyQjgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTI0RTg4N0FGRDk5MTFFNjlDNTFBODNCMUQwNzgyQjgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFMjRFODg3N0ZEOTkxMUU2OUM1MUE4M0IxRDA3ODJCOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFMjRFODg3OEZEOTkxMUU2OUM1MUE4M0IxRDA3ODJCOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PmlSGaMAAAujSURBVHja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);
  background-repeat: repeat;
}

.map * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
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

.mapTypeSelectBox {
  position: absolute;
  left: 230px;
  top: 20px;
  width: 100px;
  height: 30px;
}

.mapTypeSelectBox select {
  width: 100%;
  height: 100%;
}

.searchBox {
  position: absolute;
  left: 20px;
  top: 20px;
  width: 200px;
}

.searchInput {
  width: 100%;
  height: 30px;
}

.searchInput input,
.posInput input {
  width: 100%;
  height: 100%;
  padding: 0 10px;
}

.searchList {
  position: absolute;
  left: 0px;
  top: 35px;
  width: 100%;
  background-color: #fff;
}

.searchList .searchItem {
  width: 100%;
  height: 30px;
  line-height: 30px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 10px;
  cursor: pointer;
}

.searchList .searchItem:hover {
  background-color: #f5f5f5;
}

.posInput {
  position: absolute;
  right: 20px;
  top: 20px;
  width: 300px;
  height: 30px;
}

.backCenterBtn {
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 50px;
  height: 50px;
  background-image: url("./assets/location.png");
  background-size: cover;
  cursor: pointer;
}

.scaleBtnBox {
  position: absolute;
  right: 30px;
  bottom: 80px;
  width: 29px;
  height: 73px;
  padding: 0 2px;
  background: #fff;
  border-radius: 3px;
}

.scaleBtn {
  width: 24px;
  height: 36px;
  margin: 0 auto;
  background: url("./assets/scale.png") no-repeat;
  cursor: pointer;
}

.scaleBtn.in {
  background-position: -3px 3px;
  border-bottom: 1px #dfdfdf solid;
}

.scaleBtn.out {
  background-position: -3px -156px;
}

.scaleBtn.disabled {
  opacity: 0.2;
}

.overlay {
  position: absolute;
  transform: translate(-50%, -50%);
}
</style>
