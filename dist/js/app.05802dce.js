(function(e){function t(t){for(var i,a,r=t[0],c=t[1],h=t[2],u=0,d=[];u<r.length;u++)a=r[u],Object.prototype.hasOwnProperty.call(o,a)&&o[a]&&d.push(o[a][0]),o[a]=0;for(i in c)Object.prototype.hasOwnProperty.call(c,i)&&(e[i]=c[i]);l&&l(t);while(d.length)d.shift()();return s.push.apply(s,h||[]),n()}function n(){for(var e,t=0;t<s.length;t++){for(var n=s[t],i=!0,r=1;r<n.length;r++){var c=n[r];0!==o[c]&&(i=!1)}i&&(s.splice(t--,1),e=a(a.s=n[0]))}return e}var i={},o={app:0},s=[];function a(t){if(i[t])return i[t].exports;var n=i[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,a),n.l=!0,n.exports}a.m=e,a.c=i,a.d=function(e,t,n){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},a.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)a.d(n,i,function(t){return e[t]}.bind(null,i));return n},a.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="dist/";var r=window["webpackJsonp"]=window["webpackJsonp"]||[],c=r.push.bind(r);r.push=t,r=r.slice();for(var h=0;h<r.length;h++)t(r[h]);var l=c;s.push([0,"chunk-vendors"]),n()})({0:function(e,t,n){e.exports=n("56d7")},"21de":function(e,t,n){},"44cc":function(e,t,n){"use strict";n("55ad")},"55ad":function(e,t,n){},"56d7":function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var i=n("7a23"),o={class:"app"},s={class:"mapContainer"},a={class:"btnGroup"};function r(e,t,n,r,c,h){var l=this;return Object(i["g"])(),Object(i["d"])("div",o,[Object(i["e"])("div",s,[(Object(i["g"])(),Object(i["c"])(Object(i["k"])(c.comp)))]),Object(i["e"])("div",a,[Object(i["e"])("div",{class:Object(i["f"])(["btn",{active:"New"===this.comp}]),onClick:t[0]||(t[0]=function(e){return l.comp="New"})}," 优化版 ",2),Object(i["e"])("div",{class:Object(i["f"])(["btn",{active:"Old"===this.comp}]),onClick:t[1]||(t[1]=function(e){return l.comp="Old"})}," 原始版 ",2)])])}var c=function(e){return Object(i["i"])("data-v-e1a8d70c"),e=e(),Object(i["h"])(),e},h={class:"map",ref:"map"},l={class:"center"},u=c((function(){return Object(i["e"])("div",{class:"line lineX"},null,-1)})),d=c((function(){return Object(i["e"])("div",{class:"line lineY"},null,-1)}));function m(e,t,n,o,s,a){return Object(i["g"])(),Object(i["d"])("div",h,[Object(i["e"])("canvas",{ref:"canvas",onMousedown:t[0]||(t[0]=function(){return a.onMousedown&&a.onMousedown.apply(a,arguments)})},null,544),Object(i["e"])("div",l,Object(i["l"])(this.center[0]+","+this.center[1]),1),u,d],512)}for(var p=n("3835"),f=n("2909"),v=n("d4ec"),y=n("bee2"),b=(n("d81d"),n("99af"),n("d3b7"),n("159b"),n("b64b"),n("3623")),w=function(e){return e*(Math.PI/180)},O=function(e){return e*(180/Math.PI)},j=6378137,g=function(e,t){var n=w(e)*j,i=w(t),o=Math.sin(i),s=j/2*Math.log((1+o)/(1-o));return[n,s]},x=function(e,t){var n=O(e)/j,i=O(2*Math.atan(Math.exp(t/j))-Math.PI/2);return[n,i]},M=2*Math.PI*j,z=256,C=function(e){var t=Math.pow(2,e),n=t*z;return M/n},T=[],k=0;k<=18;k++)T.push(C(k));var L=function(e,t){return e+=M/2,t=M/2-t,[e,t]},I=function(e,t,n){var i=L(e,t);e=i[0],t=i[1];var o=T[n],s=Math.floor(e/o/z),a=Math.floor(t/o/z);return[s,a]},P=function(e,t,n){var i=L.apply(void 0,Object(f["a"])(g(e,t))),o=Object(p["a"])(i,2),s=o[0],a=o[1],r=T[n],c=Math.floor(s/r),h=Math.floor(a/r);return[c,h]},_=function(e,t,n){var i=[1,2,3,4],o=i[Math.floor(Math.random()*i.length)];return"https://webrd0".concat(o,".is.autonavi.com/appmaptile?x=").concat(e,"&y=").concat(t,"&z=").concat(n,"&lang=zh_cn&size=1&scale=1&style=8")},R="0913a20b5d5a703b920e1ff0d9d26559",Z=function(){function e(t){var n=t.ctx,i=t.row,o=t.col,s=t.zoom,a=t.x,r=t.y,c=t.shouldRender;Object(v["a"])(this,e),this.ctx=n,this.row=i,this.col=o,this.zoom=s,this.x=a,this.y=r,this.shouldRender=c,this.url="",this.cacheKey=this.row+"_"+this.col+"_"+this.zoom,this.img=null,this.loaded=!1,this.timer=null,this.createUrl(),this.load()}return Object(y["a"])(e,[{key:"createUrl",value:function(){this.url=_(this.row,this.col,this.zoom)}},{key:"load",value:function(){var e=this;this.img=new Image,this.img.src=this.url,this.timer=setTimeout((function(){e.createUrl(),e.load()}),1e3),this.img.onload=function(){clearTimeout(e.timer),e.loaded=!0,e.render()}}},{key:"render",value:function(){this.loaded&&this.shouldRender(this.cacheKey)&&this.ctx.drawImage(this.img,this.x,this.y)}},{key:"updatePos",value:function(e,t){return this.x=e,this.y=t,this}}]),e}(),E={name:"App",data:function(){return{width:0,height:0,isMousedown:!1,tileCache:{},currentTileCache:{},center:[120.148732,30.231006],zoom:17,minZoom:3,maxZoom:18,ctx:null,lastZoom:0,scale:1,scaleTmp:1,playback:null}},mounted:function(){this.initCanvas(),this.renderTiles(),window.addEventListener("mousemove",this.onMousemove),window.addEventListener("mouseup",this.onMouseup),window.addEventListener("wheel",this.onMousewheel)},beforeUnmount:function(){window.removeEventListener("mousemove",this.onMousemove),window.removeEventListener("mouseup",this.onMouseup),window.removeEventListener("wheel",this.onMousewheel)},methods:{initCanvas:function(){var e=this.$refs.map.getBoundingClientRect(),t=e.width,n=e.height;this.width=t,this.height=n;var i=this.$refs.canvas;i.width=this.width,i.height=this.height,this.ctx=i.getContext("2d"),this.ctx.translate(this.width/2,this.height/2)},renderTiles:function(){var e=this,t=I.apply(void 0,Object(f["a"])(g.apply(void 0,Object(f["a"])(this.center))).concat([this.zoom])),n=[t[0]*z,t[1]*z],i=P.apply(void 0,Object(f["a"])(this.center).concat([this.zoom])),o=[i[0]-n[0],i[1]-n[1]],s=Math.ceil((this.width/2-o[0])/z),a=Math.ceil((this.height/2-o[1])/z),r=Math.ceil((this.width/2-(z-o[0]))/z),c=Math.ceil((this.height/2-(z-o[1]))/z);this.currentTileCache={};for(var h=-s;h<=r;h++)for(var l=-a;l<=c;l++){var u=t[0]+h,d=t[1]+l,m=h*z-o[0],p=l*z-o[1],v=u+"_"+d+"_"+this.zoom;this.currentTileCache[v]=!0,this.tileCache[v]?this.tileCache[v].updatePos(m,p).render():this.tileCache[v]=new Z({ctx:this.ctx,row:u,col:d,zoom:this.zoom,x:m,y:p,shouldRender:function(t){return e.currentTileCache[t]}})}},clear:function(){this.ctx.clearRect(-this.width/2,-this.height/2,this.width,this.height)},onMousedown:function(e){1===e.which&&(this.isMousedown=!0)},onMousemove:function(e){if(this.isMousedown){var t=e.movementX*T[this.zoom],n=e.movementY*T[this.zoom],i=g.apply(void 0,Object(f["a"])(this.center)),o=Object(p["a"])(i,2),s=o[0],a=o[1];this.center=x(s-t,n+a),this.clear(),this.renderTiles()}},onMouseup:function(){this.isMousedown=!1},onMousewheel:function(e){var t=this;e.deltaY>0?this.zoom>this.minZoom&&this.zoom--:this.zoom<this.maxZoom&&this.zoom++,this.lastZoom!==this.zoom&&(this.lastZoom=this.zoom,this.scale*=e.deltaY>0?.5:2,this.playback&&this.playback.stop(),this.playback=Object(b["a"])({from:this.scaleTmp,to:this.scale,onUpdate:function(e){t.scaleTmp=e,t.ctx.save(),t.clear(),t.ctx.scale(e,e),Object.keys(t.currentTileCache).forEach((function(e){t.tileCache[e].render()})),t.ctx.restore()},onComplete:function(){t.scale=1,t.scaleTmp=1,t.renderTiles()}}))}}},U=(n("44cc"),n("6b0d")),B=n.n(U);const S=B()(E,[["render",m],["__scopeId","data-v-e1a8d70c"]]);var N=S,V=(n("b0c0"),function(e){return Object(i["i"])("data-v-55edc4c4"),e=e(),Object(i["h"])(),e}),Y={class:"map",ref:"map"},K=V((function(){return Object(i["e"])("div",{class:"line lineX"},null,-1)})),X=V((function(){return Object(i["e"])("div",{class:"line lineY"},null,-1)})),$={class:"searchBox"},A={class:"searchInput"},D={class:"searchList"},J=["onClick"],G={class:"posInput"},q={class:"scaleBtnBox"};function F(e,t,n,o,s,a){return Object(i["g"])(),Object(i["d"])("div",Y,[Object(i["e"])("div",{class:"mapBox",ref:"mapBox",onMousedown:t[0]||(t[0]=function(){return a.onMousedown&&a.onMousedown.apply(a,arguments)})},null,544),K,X,Object(i["e"])("div",$,[Object(i["e"])("div",A,[Object(i["n"])(Object(i["e"])("input",{type:"text",placeholder:"搜索...","onUpdate:modelValue":t[1]||(t[1]=function(e){return s.searchText=e}),onInput:t[2]||(t[2]=function(){return a.onSearch&&a.onSearch.apply(a,arguments)}),onKeyup:t[3]||(t[3]=Object(i["o"])((function(){return a.onSearch&&a.onSearch.apply(a,arguments)}),["enter"]))},null,544),[[i["m"],s.searchText]])]),Object(i["e"])("div",D,[(Object(i["g"])(!0),Object(i["d"])(i["a"],null,Object(i["j"])(s.searchResultList,(function(e,t){return Object(i["g"])(),Object(i["d"])("div",{class:"searchItem",key:t,onClick:function(t){return a.go(e.location)}},Object(i["l"])(e.name),9,J)})),128))])]),Object(i["e"])("div",G,[Object(i["n"])(Object(i["e"])("input",{type:"text",placeholder:"经纬度...","onUpdate:modelValue":t[4]||(t[4]=function(e){return s.posValue=e}),onKeyup:t[5]||(t[5]=Object(i["o"])((function(){return a.onChangePos&&a.onChangePos.apply(a,arguments)}),["enter"]))},null,544),[[i["m"],s.posValue]])]),Object(i["e"])("div",{class:"backCenterBtn",onClick:t[6]||(t[6]=function(){return a.backCenter&&a.backCenter.apply(a,arguments)})}),Object(i["e"])("div",q,[Object(i["e"])("div",{class:Object(i["f"])(["scaleBtn in",{disabled:s.zoom>=s.maxZoom}]),onClick:t[7]||(t[7]=function(){return a.zoomIn&&a.zoomIn.apply(a,arguments)})},null,2),Object(i["e"])("div",{class:Object(i["f"])(["scaleBtn out",{disabled:s.zoom<=s.minZoom}]),onClick:t[8]||(t[8]=function(){return a.zoomOut&&a.zoomOut.apply(a,arguments)})},null,2)])],512)}var H=n("1da1"),Q=(n("96cf"),n("a15b"),n("ac1f"),n("1276"),n("a9e3"),n("498a"),n("362d")),W=function(){function e(t){var n=t.layer,i=t.row,o=t.col,s=t.zoom,a=t.x,r=t.y,c=t.shouldRender;Object(v["a"])(this,e),this.layer=n,this.row=i,this.col=o,this.zoom=s,this.x=a,this.y=r,this.shouldRender=c,this.url="",this.cacheKey=this.row+"_"+this.col+"_"+this.zoom,this.img=null,this.opacity=0,this.loaded=!1,this.timer=null,this.fadeInDuration=500,this.createUrl(),this.load()}return Object(y["a"])(e,[{key:"createUrl",value:function(){this.url=_(this.row,this.col,this.zoom)}},{key:"load",value:function(){var e=this,t=new Image;t.src=this.url,this.timer=setTimeout((function(){e.createUrl(),e.load()}),1e3),t.onload=function(){clearTimeout(e.timer),e.img=new Q["a"].Image({image:t,width:z,height:z,opacity:e.opacity}),e.loaded=!0,e.render()}}},{key:"render",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];this.loaded&&this.shouldRender(this.cacheKey)&&(this.layer.add(this.img),this.img.x(this.x).y(this.y),e&&0!==this.opacity&&this.hide(),this.fadeIn())}},{key:"fadeIn",value:function(){var e=this;if(!(this.opacity>=1)){var t=this.opacity,n=new Q["a"].Animation((function(i){var o=i.time/e.fadeInDuration*1+t;e.opacity=o,e.img.opacity(o),o>=1&&n.stop()}),this.layer);n.start()}}},{key:"hide",value:function(){this.opacity=0,this.img.opacity(0)}},{key:"updateLayer",value:function(e){return this.layer=e,this}},{key:"updatePos",value:function(e,t){return this.x=e,this.y=t,this}}]),e}(),ee={name:"App",data:function(){return{width:0,height:0,isMousedown:!1,tileCache:{},currentTileCache:{},initCenter:[120.148732,30.231006],center:[120.148732,30.231006],zoom:14,minZoom:3,maxZoom:18,lastZoom:0,scale:1,scaleTmp:1,playback:null,stage:null,layer1:null,layer2:null,useLayer1:!0,searchText:"",searchTimer:null,searchResultList:[],translate:[0,0],translateTmp:[0,0],translatePlayback:null,posValue:""}},watch:{center:function(e){this.posValue=e.join(",")}},mounted:function(){var e=this;return Object(H["a"])(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,e.location();case 2:e.init(),e.renderTiles(),window.addEventListener("mousemove",e.onMousemove),window.addEventListener("mouseup",e.onMouseup),window.addEventListener("wheel",e.onMousewheel);case 7:case"end":return t.stop()}}),t)})))()},beforeUnmount:function(){window.removeEventListener("mousemove",this.onMousemove),window.removeEventListener("mouseup",this.onMouseup),window.removeEventListener("wheel",this.onMousewheel)},methods:{location:function(){var e=this;return Object(H["a"])(regeneratorRuntime.mark((function t(){var n,i,o,s,a;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,fetch("https://restapi.amap.com/v3/ip?key=".concat(R));case 3:return n=t.sent,t.next=6,n.json();case 6:i=t.sent,o=i.rectangle.split(";"),s=o[0].split(","),a=o[1].split(","),e.initCenter=e.center=[(Number(s[0])+Number(a[0]))/2,(Number(s[1])+Number(a[1]))/2],t.next=16;break;case 13:t.prev=13,t.t0=t["catch"](0),console.log(t.t0);case 16:case"end":return t.stop()}}),t,null,[[0,13]])})))()},init:function(){var e=this.$refs.mapBox.getBoundingClientRect(),t=e.width,n=e.height;this.width=t,this.height=n,this.stage=new Q["a"].Stage({container:this.$refs.mapBox,width:t,height:n}),this.layer1=new Q["a"].Layer,this.layer1.x(this.width/2).y(this.height/2),this.stage.add(this.layer1),this.layer2=new Q["a"].Layer,this.layer2.x(this.width/2).y(this.height/2),this.stage.add(this.layer2)},renderTiles:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]&&arguments[0],n=I.apply(void 0,Object(f["a"])(g.apply(void 0,Object(f["a"])(this.center))).concat([this.zoom])),i=[n[0]*z,n[1]*z],o=P.apply(void 0,Object(f["a"])(this.center).concat([this.zoom])),s=[o[0]-i[0],o[1]-i[1]],a=Math.ceil((this.width/2-s[0])/z),r=Math.ceil((this.height/2-s[1])/z),c=Math.ceil((this.width/2-(z-s[0]))/z),h=Math.ceil((this.height/2-(z-s[1]))/z);this.currentTileCache={};for(var l=-a;l<=c;l++)for(var u=-r;u<=h;u++){var d=n[0]+l,m=n[1]+u,p=l*z-s[0],v=u*z-s[1],y=d+"_"+m+"_"+this.zoom;this.currentTileCache[y]=!0;var b=this.useLayer1?this.layer1:this.layer2;this.tileCache[y]?this.tileCache[y].updateLayer(b).updatePos(p,v).render(t):this.tileCache[y]=new W({layer:b,row:d,col:m,zoom:this.zoom,x:p,y:v,shouldRender:function(t){return e.currentTileCache[t]}})}},clearLayer:function(){this.layer1.removeChildren(),this.layer2.removeChildren()},resetLayer:function(){var e=this.useLayer1?this.layer1:this.layer2,t=this.useLayer1?this.layer2:this.layer1;t.scale({x:1,y:1}),t.x(this.width/2).y(this.height/2),t.removeChildren(),e.zIndex(0),t.zIndex(1)},onMousedown:function(e){1===e.which&&(this.isMousedown=!0)},onMousemove:function(e){if(this.isMousedown){var t=e.movementX*T[this.zoom],n=e.movementY*T[this.zoom],i=g.apply(void 0,Object(f["a"])(this.center)),o=Object(p["a"])(i,2),s=o[0],a=o[1];this.center=x(s-t,n+a),this.clearLayer(),this.renderTiles()}},onMouseup:function(){this.isMousedown=!1},onMousewheel:function(e){e.deltaY>0?this.zoomOut():this.zoomIn()},zoomIn:function(){this.scaleMap(!0)},zoomOut:function(){this.scaleMap(!1)},scaleMap:function(e){var t=this;e?this.zoom<this.maxZoom&&this.zoom++:this.zoom>this.minZoom&&this.zoom--,this.lastZoom!==this.zoom&&(this.lastZoom=this.zoom,this.scale*=!e>0?.5:2,this.playback&&this.playback.stop(),this.resetLayer(),this.playback=Object(b["a"])({from:this.scaleTmp,to:this.scale,onUpdate:function(e){console.log(e),t.scaleTmp=e;var n=t.useLayer1?t.layer1:t.layer2;n.scale({x:e,y:e})},onComplete:function(){t.useLayer1=!t.useLayer1,t.scale=1,t.scaleTmp=1,t.renderTiles(!0)}}))},onSearch:function(){var e=this;clearTimeout(this.searchTimer),this.searchTimer=setTimeout((function(){e.searchText.trim()?fetch("https://restapi.amap.com/v3/assistant/inputtips?key=".concat(R,"&keywords=").concat(e.searchText.trim())).then((function(e){return e.json()})).then((function(t){e.searchResultList=t.tips||[]})):e.searchResultList=[]}),300)},go:function(e){var t=this;if(!this.translatePlayback){"string"===typeof e&&(e=e.split(",").map((function(e){return Number(e)})));var n=g.apply(void 0,Object(f["a"])(e)),i=g.apply(void 0,Object(f["a"])(this.center));this.translate=[(n[0]-i[0])/T[this.zoom],(n[1]-i[1])/T[this.zoom]],this.resetLayer(),this.translatePlayback=Object(b["a"])({from:this.translateTmp.join(" "),to:this.translate.join(" "),duration:1e3,onUpdate:function(e){t.translateTmp=e.split(" ").map((function(e){return Number(e)}));var n=t.useLayer1?t.layer1:t.layer2;n.x(t.width/2-t.translateTmp[0]).y(t.translateTmp[1]+t.height/2)},onComplete:function(){t.translatePlayback=null,t.center=e,t.useLayer1=!t.useLayer1,t.translateTmp=[0,0],t.translate=[0,0],Object.keys(t.tileCache).forEach((function(e){t.currentTileCache[e]||t.tileCache[e].hide()})),t.renderTiles()}})}},backCenter:function(){this.go(this.initCenter)},onChangePos:function(){this.go(this.posValue)}}};n("6431");const te=B()(ee,[["render",F],["__scopeId","data-v-55edc4c4"]]);var ne=te,ie={components:{New:ne,Old:N},data:function(){return{comp:"New"}}};n("c64c");const oe=B()(ie,[["render",r],["__scopeId","data-v-7fb52170"]]);var se=oe;Object(i["b"])(se).mount("#app")},6431:function(e,t,n){"use strict";n("21de")},c64c:function(e,t,n){"use strict";n("e472")},e472:function(e,t,n){}});
//# sourceMappingURL=app.05802dce.js.map