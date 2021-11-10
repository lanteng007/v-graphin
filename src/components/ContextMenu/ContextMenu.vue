<template>
  <div
    class="graphin-components-contextmenu"
    ref="containerRef"
    :style="positionStyle"
  >
    <ul v-if="visible" class="graphin-components-contextmenu-content">
      <template v-if="options">
        <li
          class="graphin-components-contextmenu-content-item"
          v-for="option in options"
          :key="option.key || option.name"
          @click="handleMenuItemClick(option, option.onClick)"
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
      </template>
      <slot v-else :item="item"></slot>
    </ul>
  </div>
</template>
<script>
export default {
  name: "ContextMenu",
  inject: ["graphin", "setGraphinProperty"],
  props: {
    bindType: {
      type: String,
      default: "node",
    },
    options: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      visible: false,
      x: 0,
      y: 0,
      item: null,
    };
  },
  computed: {
    graph() {
      return this.graphin().graph || {};
    },
    positionStyle() {
      const obj = {
        position: "absolute",
        left: this.x + "px",
        top: this.y + "px",
      };
      return obj;
    },
  },
  methods: {
    handleShow(e) {
      e.preventDefault();
      e.stopPropagation();
      const width = this.graph.get("width");
      const height = this.graph.get("height");
      const containerRef = this.$refs.containerRef;
      const bbox = containerRef.getBoundingClientRect();

      const offsetX = this.graph.get("offsetX") || 0;
      const offsetY = this.graph.get("offsetY") || 0;

      const graphTop = this.graph.getContainer().offsetTop;
      const graphLeft = this.graph.getContainer().offsetLeft;

      let x = e.canvasX + graphLeft + offsetX;
      let y = e.canvasY + graphTop + offsetY;

      // when the menu is (part of) out of the canvas

      if (x + bbox.width > width) {
        x = e.canvasX - bbox.width - offsetX + graphLeft;
      }
      if (y + bbox.height > height) {
        y = e.canvasY - bbox.height - offsetY + graphTop;
      }

      if (this.bindType === "node") {
        // 如果是节点，则x，y指定到节点的中心点
        // eslint-disable-next-line no-underscore-dangle
        const { x: PointX, y: PointY } = e.item && e.item.getModel();
        const CenterCanvas = this.graph.getCanvasByPoint(PointX, PointY);

        const daltX = e.canvasX - CenterCanvas.x;
        const daltY = e.canvasY - CenterCanvas.y;
        x = x - daltX;
        y = y - daltY;
      }
      /** 设置变量 */
      this.setState({
        visible: true,
        x,
        y,
        item: e.item || null,
      });
    },
    handleClose() {
      if (this.visible) {
        this.setState({
          visible: false,
          x: 0,
          y: 0,
          item: null,
        });
      }
    },
    setState({ visible, x, y, item }) {
      this.visible = visible;
      this.x = x;
      this.y = y;
      this.item = item;
    },
    bindEvent() {
      this.graph.on(`${this.bindType}:contextmenu`, this.handleShow);
      this.graph.on("canvas:click", this.handleClose);
      this.graph.on("canvas:drag", this.handleClose);
      this.graph.on("wheelzoom", this.handleClose);
    },
    removeEvent() {
      this.graph.off(`${this.bindType}:contextmenu`, this.handleShow);
      this.graph.off("canvas:click", this.handleClose);
      this.graph.off("canvas:drag", this.handleClose);
      this.graph.off("wheelzoom", this.handleClose);
    },
    bindContextMenu() {
      const contextmenu = {
        ...this.graphin.contextmenu,
        [this.bindType]: {
          handleOpen: this.handleShow,
          handleClose: this.handleClose,
          item: this.item,
          visible: this.visible,
          x: this.x,
          y: this.y,
          bindType: this.bindType,
        },
      };
      this.setGraphinProperty({ contextmenu });
    },
    handleMenuItemClick(option, callBack) {
      this.$emit("change", this.item, this.item && this.item.getModel())
      callBack && callBack(option, this.item)
      this.handleClose();
    },
  },
  created() {
    this.$nextTick(() => {
      this.bindEvent();
      this.bindContextMenu();
    });
  },
  beforeDestroy() {
    this.removeEvent();
  },
};
</script>
<style lang="scss" scoped>
.graphin-components-contextmenu {
  min-width: 100px;
  background: #fff;
  border-radius: 4px;
  .graphin-components-contextmenu-content {
    list-style: none;
    width: 100%;
    padding: 0;
    margin: 0;
    border-radius: 4px;
    box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2),
      0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12);
    & > li.graphin-components-contextmenu-content-item {
      padding: 8px;
      cursor: pointer;
      &:hover {
        background: #ddd;
      }
    }
  }
}
</style>