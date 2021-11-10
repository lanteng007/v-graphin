<template>
  <div class="graphin-components-tooltip" :class="placement" :style="positionStyle">
    <div v-if="visible" class="graphin-components-tooltip-content">
      <div v-if="hasArrow" class="tooltip-arrow" :class="placement"></div>
      <slot v-bind:itemModel="item ? item.getModel() : null"></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: "Tooltip",
  inject: ["graphin", "setGraphinProperty"],
  props: {
    /**
     * @description tooltip绑定的图元素
     * @default node
     */
    bindType: {
      type: String,
      default: "node",
    },
    /**
     * @description Tooltip 的位置
     * @default top
     */
    placement: {
      type: String,
      default: "top",
    },
    /**
     * @description 是否展示小箭头
     * @description.en-US display arrow
     */
    hasArrow: {
      type: Boolean,
      default: true,
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
      let nodeSize = 40;
      if (this.item) {
        const modelStyle = this.item.getModel().style;
        if (modelStyle) {
          nodeSize = modelStyle.keyshape.size;
        }
      }
      const padding = 12;
      nodeSize = nodeSize + padding;
      let obj = {
        left: this.x + "px",
        top: this.y + "px",
      };
      if (this.bindType === "edge") {
        obj = {
          left: this.x + 'px',
          top: this.y + 'px',
        };
      }

      if (this.placement === "top") {
        if (this.visible) {
          obj = {
            left: this.x + 'px',
            top: (this.y - nodeSize / 2) + 'px',
            opacity: 1,
            transform: "translate(-50%,calc(-100% - 6px))",
            transition: "opacity 0.5s,transform 0.5s",
          };
        } else {
          obj = {
            left: 0,
            top: 0,
            opacity: 0.5,
            transform: "translate(-50%,-100%)",
          };
        }
        
      }
      if (this.placement === "bottom") {
        if (this.visible) {
          obj = {
            left: this.x + 'px',
            top: (this.y + nodeSize / 2) + 'px',
            opacity: 1,
            transform: "translate(-50%,6px)",
            transition: "opacity 0.5s,transform 0.5s",
          };
        } else {
          obj = {
            left: this.x + 'px',
            top: (this.y + nodeSize / 2) + 'px',
            opacity: 0.5,
            transform: "translate(-50%,0px)",
          };
        }
        
      }
      if (this.placement === "left") {
        if (this.visible) {
          obj = {
            left: (this.x - nodeSize / 2) + 'px',
            top: this.y + 'px',
            transform: "translate(calc(-100% - 6px),-50%)",
            opacity: 1,
            transition: "opacity 0.5s,transform 0.5s",
          };
        } else {
          obj = {
            opacity: 0,
            left: (this.x - nodeSize / 2) + 'px',
            top: this.y + 'px',
            transform: "translate(-100%,-50%)",
          };
        }
        
      }
      if (this.placement === "right") {
        if (this.visible) {
          obj = {
            left: (this.x + nodeSize / 2) + 'px',
            top: this.y + 'px',
            transform: "translate(6px,-50%)",
            opacity: 1,
            transition: "opacity 0.5s,transform 0.5s",
          };
        } else {
          obj = {
            left: (this.x + nodeSize / 2) + 'px',
            top: this.y + 'px',
            transform: "translate(0,-50%)",
            opacity: 0,
          };
        }
        
      }
      if (this.placement === "center") {
        if (this.visible) {
          obj = {
            left: this.x + 'px',
            top: this.y + 'px',
            opacity: 1,
            transition: "opacity 0.5s,transform 0.5s",
          };
        } else {
          obj = {
            left: this.x + 'px',
            top: this.y + 'px',
            opacity: 0,
          };
        }
      }
      obj = {
        position: 'absolute',
        ...obj
      }
      return obj;
    },
  },
  methods: {
    handleShow(e) {
      e.preventDefault();
      e.stopPropagation();
      const point = this.graph.getPointByClient(e.clientX, e.clientY);
      let { x, y } = this.graph.getCanvasByPoint(point.x, point.y);
      if (this.bindType === "node") {
        // 如果是节点，则x，y指定到节点的中心点
        // eslint-disable-next-line no-underscore-dangle
        if (e.item) {
          const { x: PointX = 0, y: PointY = 0 } = e.item.getModel();
          const CenterCanvas = this.graph.getCanvasByPoint(PointX, PointY);

          const daltX = e.canvasX - CenterCanvas.x;
          const daltY = e.canvasY - CenterCanvas.y;
          x = x - daltX;
          y = y - daltY;
        }
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
    handleDragStart() {
      if (this.visible) {
        this.setState({
          visible: false,
          x: 0,
          y: 0,
          item: null,
        });
      }
    },
    handleDragEnd(e) {
      const point = this.graph.getPointByClient(e.clientX, e.clientY);
      let { x, y } = this.graph.getCanvasByPoint(point.x, point.y);
      if (this.bindType === "node") {
        // 如果是节点，则x，y指定到节点的中心点
        // eslint-disable-next-line no-underscore-dangle
        if (e.item) {
          const { x: PointX = 0, y: PointY = 0 } = e.item.getModel();
          const CenterCanvas = this.graph.getCanvasByPoint(PointX, PointY);

          const daltX = e.canvasX - CenterCanvas.x;
          const daltY = e.canvasY - CenterCanvas.y;
          x = x - daltX;
          y = y - daltY;
        }
        this.setState({
          visible: true,
          x,
          y,
          item: e.item || null,
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
      this.graph.on(`${this.bindType}:mouseenter`, this.handleShow);
      this.graph.on(`${this.bindType}:mouseleave`, this.handleClose);
      this.graph.on(`afterremoveitem`, this.handleClose);
      this.graph.on(`node:dragstart`, this.handleDragStart);
      this.graph.on(`node:dragend`, this.handleDragEnd);
    },
    removeEvent() {
      this.graph.off(`${this.bindType}:mouseenter`, this.handleShow);
      this.graph.off(`${this.bindType}:mouseleave`, this.handleClose);
      this.graph.off(`afterremoveitem`, this.handleClose);
      this.graph.off(`node:dragstart`, this.handleDragStart);
      this.graph.off(`node:dragend`, this.handleDragEnd);
    },
    bindTooltip() {
      const tooltip = {
        ...this.graphin.tooltip,
        [this.bindType]: {
          handleOpen: this.handleShow,
          handleClose: this.handleClose,
          item: this.item,
          visible: this.visible,
          x: this.x,
          y: this.y,
        },
      };
      this.setGraphinProperty({ tooltip });
    },
  },
  created() {
    this.$nextTick(() => {
      this.bindEvent();
      this.bindTooltip();
    });
  },
  beforeDestroy() {
    this.removeEvent();
  },
};
</script>
<style lang="scss" scoped>
.graphin-components-tooltip {
  min-width: 200px;
  background: #fff;
  &.top {
    transform: translate(0, -100%);
  }
  &.bottom {
    transform: translate(0, 0);
  }
  &.right {
    transform: translate(0, 0);
  }
  &.left {
    transform: translate(-100%, 0);
  }
  .tooltip-arrow {
    position: absolute;
    display: block;
    width: 8px;
    height: 8px;
    background: 0 0;
    border-style: solid;
    border-width: 4px;
    color: #fff;
    background-color: #fff;

    &.top {
      left: 50%;
      top: 100%;
      transform: translate(-50%, -50%) rotate(45deg);
    }
    &.bottom {
      left: 50%;
      top: 0;
      transform: translate(-50%, -50%) rotate(45deg);
    }
    &.left {
      left: 100%;
      top: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
    }
    &.right {
      left: 0;
      top: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
    }
  }
}
div.graphin-components-tooltip-content {
  width: 100%;
  padding: 8px;
  box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14),
    0px 3px 14px 2px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  box-sizing: border-box;
}

</style>