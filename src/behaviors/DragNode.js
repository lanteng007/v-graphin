export default {
  name: 'DragNode',
  inject: ['graphin'],
  props: {
    /**
   * @description 是否在拖拽节点时更新所有与之相连的边，默认为 true
   * @default true
   */
    updateEdge: {
      type: Boolean,
      default: true,
    },
    /**
     * @description 节点拖拽时的绘图属性
     * @default { strokeOpacity: 0.6, fillOpacity: 0.6 }
     */
    delegateStyle: {
      type: Object,
      default() {
        return {}
      }
    },
    /**
     * @description 是否开启delegate
     * @default false
     */
    enableDelegate: {
      type: Boolean,
      default: false
    },
    /**
     * @description 拖动节点过程中是否只改变 Combo 的大小，而不改变其结构
     * @default false
     */
    onlyChangeComboSize: {
      type: Boolean,
      default: false
    },
    /**
     * @description 拖动过程中目标 combo 状态样式
     * @default ''
     */
    comboActiveState: {
      type: String,
      default: ''
    },
    /**
     * @description 选中样式
     * @default selected
     */
    selectedState: {
      type: String,
      default: 'selected'
    },
    /** 是否禁用该功能 */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      type: 'drag-node',
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
    const config = {
      ...this
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