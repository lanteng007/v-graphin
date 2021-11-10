export default {
  name: 'LassoSelect',
  inject: ['graphin'],
  props: {
    /** 拖动框选框的样式，包括 fill、fillOpacity、stroke 和 lineWidth 四个属性; */
    delegateStyle: {
      type: Object,
      default() {
        return {
          fill: '#EEF6FF',
          fillOpacity: 0.4,
          stroke: '#DDEEFE',
          lineWidth: 1,
        }
      },
    },
    /** 选中节点时的回调，参数 nodes 表示选中的节点； */
    onSelect: {
      type: Function,
      default() {
        return () => {}
      },
    },
    /** 取消选中节点时的回调，参数 nodes 表示取消选中的节点； */
    onDeselect: {
      type: Function,
      default() {
        return () => {}
      },
    },
    /** 选中的状态，默认值为 'selected' */
    selectedState: {
      type: String,
      default: 'selected',
    },
    /** 触发框选的动作，默认为 'shift'，即用户按住 Shift 键拖动就可以进行框选操作，可配置的的选项为: 'shift'、'ctrl' / 'control'、'alt' 和 'drag' ，不区分大小写 */
    trigger:{
      type: String,
      default: 'shift',
    },
    /** 框选过程中是否选中边，默认为 true，用户配置为 false 时，则不选中边； */
    includeEdges: {
      type: Boolean,
      default: true,
    },
    /** 是否禁用该功能 */
    /** 是否禁用该功能 */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      type: 'lasso-select',
      mode: 'default'
    }
  },
  computed: {
    graph() {
      return this.graphin().graph || {}
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