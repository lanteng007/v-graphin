
export default {
  name: 'DragCanvas',
  inject: ['graphin'],
  props: {
    /** 允许拖拽方向，支持'x'，'y'，'both'，默认方向为 'both'； */
    direction: {
      type: String,
      default: 'both',
    },
    /** 是否开启优化，开启后拖动画布过程中隐藏所有的边及节点上非 keyShape 部分，默认关闭； */
    enableOptimize: {
      type: Boolean,
      default: false,
    },
    /**
     * drag-canvas 可拖动的扩展范围，默认为 0，即最多可以拖动一屏的位置
     *  当设置的值大于 0 时，即拖动可以超过一屏
     * 当设置的值小于 0 时，相当于缩小了可拖动范围
     * 具体实例可参考：https://gw.alipayobjects.com/mdn/rms_f8c6a0/afts/img/A*IFfoS67_HssAAAAAAAAAAAAAARQnAQ
     */
    scalableRange: {
      type: Number,
      default: 0,
    },
    /**  是否允许触发该操作； */
    shouldBegin:{
      type: Function,
      default() {
        return () => true
      },
    },
    allowDragOnItem: {
      type: Boolean,
      default: false,
    },
    /** 是否禁用该功能 */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      type: 'drag-canvas',
      mode: 'default'
    }
  },
  computed: {
    graph() {
      return this.graphin.graph || {}
    }
  },
  created() {
    this.graph.removeBehaviors(this.type, this.mode);
    if (this.disabled) {
      return;
    }
    const { type, direction, enableOptimize, scalableRange, shouldBegin, allowDragOnItem } = this
    const config = {
      type,
      direction,
      enableOptimize,
      scalableRange,
      shouldBegin,
      allowDragOnItem
    }
    this.graph.addBehaviors(config, this.mode);
  },
  beforeDestroy() {
    if (!this.graph.destroyed) {
        this.graph.removeBehaviors(this.type, this.mode);
      }
  },
  render: () => {}
}