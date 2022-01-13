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
export const lngLat2Mercator = (lng, lat) => {
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
export const mercatorToLngLat = (x, y) => {
    let lng = radToAngle(x) / EARTH_RAD
    let lat = radToAngle(2 * Math.atan(Math.exp(y / EARTH_RAD)) - Math.PI / 2)
    return [lng, lat]
}

// 地球周长
const EARTH_PERIMETER = 2 * Math.PI * EARTH_RAD
// 瓦片像素
export const TILE_SIZE = 256

// 获取某一层级下的分辨率
export const getResolution = (n) => {
    const tileNums = Math.pow(2, n)
    const tileTotalPx = tileNums * TILE_SIZE
    return EARTH_PERIMETER / tileTotalPx
}

// 分辨率列表
export const resolutions = []
for (let i = 0; i <= 18; i++) {
    resolutions.push(getResolution(i))
}

// 转换3857坐标的原点
export const transformXY = (x, y) => {
    x += EARTH_PERIMETER / 2
    y = EARTH_PERIMETER / 2 - y
    return [x, y]
}

// 根据3857坐标及缩放层级计算瓦片行列号
export const getTileRowAndCol = (x, y, z) => {
    let t = transformXY(x, y)
    x = t[0]
    y = t[1]
    let resolution = resolutions[z]
    let row = Math.floor(x / resolution / TILE_SIZE)
    let col = Math.floor(y / resolution / TILE_SIZE)
    return [row, col]
}

// 计算4326经纬度对应的像素坐标
export const getPxFromLngLat = (lng, lat, z) => {
    let [_x, _y] = transformXY(...lngLat2Mercator(lng, lat))
    let resolution = resolutions[z]
    let x = Math.floor(_x / resolution)
    let y = Math.floor(_y / resolution)
    return [x, y]
}

// 拼接瓦片地址
export const getTileUrl = (x, y, z) => {
    let domainIndexList = [1, 2, 3, 4]
    let domainIndex =
        domainIndexList[Math.floor(Math.random() * domainIndexList.length)]
    return `https://webrd0${domainIndex}.is.autonavi.com/appmaptile?x=${x}&y=${y}&z=${z}&lang=zh_cn&size=1&scale=1&style=8`
}