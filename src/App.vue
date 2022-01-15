<template>
  <div class="app">
    <div class="mapContainer">
      <component :is="comp"></component>
    </div>
    <div class="btnGroup">
      <div
        class="btn"
        :class="{ active: this.comp === 'New' }"
        @click="this.comp = 'New'"
      >
        优化版
      </div>
      <div
        class="btn"
        :class="{ active: this.comp === 'Old' }"
        @click="this.comp = 'Old'"
      >
        原始版
      </div>
    </div>
  </div>
</template>

<script>
import Old from "./Old";
import New from "./New";

export default {
  components: {
    New,
    Old,
  },
  data() {
    return {
      comp: "New",
    };
  },
};
</script>

<style scoped>
.btnGroup {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 50px;
  display: flex;
  height: 30px;
  background-color: #fff;
  border: 1px solid #b3b3b3;
  border-radius: 5px;
  overflow: hidden;
  line-height: 30px;
  cursor: pointer;
}

.btn {
  padding: 0 16px;
}

.btn.active {
  background-color: #e0e0e0;
}
</style>