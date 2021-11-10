<template>
  <div class="graphin-components-toolbar" :style="positionStyle">
    <template v-if="options">
      <ul
        class="graphin-components-toolbar-content"
        :style="{ display: isHorizontal ? 'flex' : '' }"
      >
        <li
          class="graphin-components-toolbar-content-item"
          v-for="option in options"
          :key="option.key || option.name"
          @click="handleToolbarItemClick(option, option.onClick)"
        >
          <component
            v-if="typeof option.icon === 'object'"
            :is="option.icon"
          ></component>
          <template v-else>
            <i :class="option.icon"></i>
          </template>
          {{ option.name }}
        </li>
      </ul>
    </template>
    <slot v-else :graphin="graphin()"></slot>
  </div>
</template>
<script>
export default {
  name: "Toolbar",
  inject: ["graphin", "setGraphinProperty"],
  props: {
    /**
     * @description toolbar 的配置选项
     */
    options: {
      type: Array,
      default: null,
    },
    /**
     * @description ToolbarItem的布局位置：'vertical' | 'horizontal'
     * @default horizontal
     */
    direction: {
      type: String,
      default: "horizontal",
    },
  },
  data() {
    return {};
  },
  computed: {
    isHorizontal() {
      return this.direction === "horizontal";
    },
    positionStyle() {
      const obj = {
        position: "absolute",
      };
      if (this.isHorizontal) {
        // 水平方向，默认在右上角
        obj.right = 0;
        obj.top = 0;
      } else {
        // 垂直方向，默认在左下角
        obj.left = 0;
        obj.bottom = 0;
      }
      return obj;
    },
  },
  methods: {
    handleToolbarItemClick(option) {
      this.$emit("change", this.graphin(), option);
    },
  },
};
</script>
<style lang="scss" scoped>
ul.graphin-components-toolbar-content {
  list-style: none;
  width: 100%;
  padding: 0;
  text-align: center;
  box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2),
    0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12);
  & > li {
    padding: 8px;
    cursor: pointer;
    &:hover {
      background: #ddd;
    }
  }
}
</style>