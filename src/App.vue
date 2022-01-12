<template>
  <div class="map" ref="map">
    <canvas ref="canvas" @mousedown="onMousedown"></canvas>
    <div class="center">{{this.center[0] + ',' + this.center[1]}}</div>
    <div class="line lineX"></div>
    <div class="line lineY"></div>
  </div>
</template>

<script>
// 角度转弧度
const angleToRad = (angle) => {
  return angle * (Math.PI / 180)
}

// 弧度转角度
const radToAngle = (rad) => {
  return rad * (180 / Math.PI)
}

// 地球半径
const EARTH_RAD = 6378137

// 4326转3857
const lngLat2Mercator = (lng, lat) => {
  // 经度先转弧度，然后因为 弧度 = 弧长 / 半径 ，得到弧长为 弧长 = 弧度 * 半径
  let x = angleToRad(lng) * EARTH_RAD
  // 纬度先转弧度
  let rad = angleToRad(lat)
  // 下面我就看不懂了
  let sin = Math.sin(rad)
  let y = (EARTH_RAD / 2) * Math.log((1 + sin) / (1 - sin))
  return [x, y]
}

// 3857转4326
const mercatorToLngLat = (x, y) => {
  let lng = radToAngle(x) / EARTH_RAD
  let lat = radToAngle(2 * Math.atan(Math.exp(y / EARTH_RAD)) - Math.PI / 2)
  return [lng, lat]
}

// 地球周长
const EARTH_PERIMETER = 2 * Math.PI * EARTH_RAD
// 瓦片像素
const TILE_SIZE = 256

// 获取某一层级下的分辨率
const getResolution = (n) => {
  const tileNums = Math.pow(2, n)
  const tileTotalPx = tileNums * TILE_SIZE
  return EARTH_PERIMETER / tileTotalPx
}

// 分辨率列表
const resolutions = []
for (let i = 0; i <= 18; i++) {
  resolutions.push(getResolution(i))
}

// 转换3857坐标的原点
const transformXY = (x, y) => {
  x += EARTH_PERIMETER / 2
  y = EARTH_PERIMETER / 2 - y
  return [x, y]
}

// 根据3857坐标及缩放层级计算瓦片行列号
const getTileRowAndCol = (x, y, z) => {
  let t = transformXY(x, y)
  x = t[0]
  y = t[1]
  let resolution = resolutions[z]
  let row = Math.floor(x / resolution / TILE_SIZE)
  let col = Math.floor(y / resolution / TILE_SIZE)
  return [row, col]
}

// 计算4326经纬度对应的像素坐标
const getPxFromLngLat = (lng, lat, z) => {
  let [_x, _y] = transformXY(...lngLat2Mercator(lng, lat))
  let resolution = resolutions[z]
  let x = Math.floor(_x / resolution)
  let y = Math.floor(_y / resolution)
  return [x, y]
}

// 拼接瓦片地址
const getTileUrl = (x, y, z) => {
  let domainIndexList = [1, 2, 3, 4]
  let domainIndex =
    domainIndexList[Math.floor(Math.random() * domainIndexList.length)]
  return `https://webrd0${domainIndex}.is.autonavi.com/appmaptile?x=${x}&y=${y}&z=${z}&lang=zh_cn&size=1&scale=1&style=8`
}

// 瓦片类
class Tile {
  constructor(opt = {}) {
    this.ctx = opt.ctx
    this.url = opt.url
    this.x = opt.x
    this.y = opt.y
    // this.ox = opt.ox || 0
    // this.oy = opt.oy || 0
    this.img = null
    this.loaded = false
    this.load()
  }

  // 加载图片
  load() {
    this.img = new Image()
    this.img.src = this.url
    this.img.onload = () => {
      this.loaded = true
      this.render()
    }
  }

  // 将图片渲染到canvas上
  render() {
    if (!this.loaded) {
      return
    }
    // this.ctx.drawImage(this.img, this.x + this.ox, this.y + this.oy)
    this.ctx.drawImage(this.img, this.x, this.y)
  }

  // 更新位置
  updatePos(x, y) {
    this.x = x
    this.y = y
    return this
  }

  // 设置偏移量
  // setOffset(ox, oy) {
  //   this.ox = ox
  //   this.oy = oy
  // }
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
      // 拖动的总距离
      // dragX: 0,
      // dragY: 0,
      // 瓦片实例列表
      // const tileList = []
      // 缓存瓦片实例
      tileCache: {},
      // 初始中心经纬度
      center: [120.148732, 30.231006], // 雷锋塔
      // 初始缩放层级
      zoom: 17,
      // canvas绘图上下文
      ctx: null,
    }
  },
  mounted() {
    this.initCanvas()
    this.getCount()
    this.renderTiles()
    window.addEventListener('mousemove', this.onMousemove)
    window.addEventListener('mouseup', this.onMouseup)
  },
  methods: {
    // 初始化画布
    initCanvas() {
      // 获取容器宽高
      let { width, height } = this.$refs.map.getBoundingClientRect()
      this.width = width
      this.height = height
      // 设置画布宽高
      let canvas = this.$refs.canvas
      canvas.width = this.width
      canvas.height = this.height
      this.ctx = canvas.getContext('2d')
      // 移动画布原点
      this.ctx.translate(this.width / 2, this.height / 2)
    },

    // 计算需要的瓦片数量
    getCount() {
      let paddingCount = 4
      // 水平方向需要的瓦片数量
      this.rowCount = Math.ceil(this.width / TILE_SIZE) + paddingCount
      // 垂直方向需要的瓦片数量
      this.colCount = Math.ceil(this.height / TILE_SIZE) + paddingCount
      // 瓦片数量的一半
      this.halfRowCount = Math.ceil(this.rowCount / 2)
      this.halfColCount = Math.ceil(this.colCount / 2)
    },

    // 计算显示范围内的瓦片行列号
    renderTiles() {
      // 中心点对应的瓦片
      let centerTile = getTileRowAndCol(...lngLat2Mercator(...this.center), this.zoom)
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
          
          // 方法一
          let cacheKey = row + '_' + col + '_' + this.zoom
          // 该瓦片已加载过
          if (this.tileCache[cacheKey]) {
            this.tileCache[cacheKey].updatePos(x, y).render()
          } else {
            // 未加载过
            this.tileCache[cacheKey] = new Tile({
              ctx: this.ctx,
              url: getTileUrl(row, col, this.zoom),
              x,
              y,
            })
          }

          // 方法二
          // let tile = null;
          // if (this.tileCache[row + "_" + col]) {
          //   tile = this.tileCache[row + "_" + col];
          //   tile.setOffset(this.dragX, this.dragY);
          //   tile.render();
          // } else {
          //   tile = new Tile({
          //     url: getTileUrl(row, col, this.zoom),
          //     x: offset[0] + offsetIndex[0] * TILE_SIZE - this.dragX,
          //     y: offset[1] + offsetIndex[1] * TILE_SIZE - this.dragY,
          //     ctx: this.ctx,
          //   });
          //   tileList.push(tile);
          //   this.tileCache[row + "_" + col] = tile;
          // }
        }
      }
    },

    // 清除画布
    clear() {
      this.ctx.clearRect(-this.width / 2, -this.height / 2, this.width, this.height)
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
      // 记录总的拖动距离
      // this.dragX += e.movementX;
      // this.dragY += e.movementY;
      // 计算本次拖动的距离对应的经纬度数据
      let mx = e.movementX * resolutions[this.zoom]
      let my = e.movementY * resolutions[this.zoom]
      let [x, y] = lngLat2Mercator(...this.center)
      // 更新拖动后的中心点经纬度
      this.center = mercatorToLngLat(x - mx, my + y)
      // 清除画布重新渲染瓦片
      this.clear()
      this.renderTiles()
    },

    // 鼠标松开
    onMouseup() {
      this.isMousedown = false
    },
  },
}
</script>

<style>
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
