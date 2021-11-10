export default {
  name: 'ActivateRelations',
  inject: ['graphin'],
  props: {
    /**
     * @description 可以是 mousenter，表示鼠标移入时触发；也可以是 click，鼠标点击时触发
     * @default mouseenter
     */
    trigger: {
      type: String,
      default: 'mouseenter'
    },
    /**
     * @description 活跃节点状态。当行为被触发，需要被突出显示的节点和边都会附带此状态，默认值为  active；可以与 graph 实例的  nodeStyle  和  edgeStyle  结合实现丰富的视觉效果。
     * @default active
     */
    activeState: {
      type: String,
      default: 'active'
    },
    /**
     * @description 非活跃节点状态。不需要被突出显示的节点和边都会附带此状态。默认值为  inactive。可以与 graph 实例的  nodeStyle  和  edgeStyle  结合实现丰富的视觉效果；
     * @default inactive
     */
    inactiveState: {
      type: String,
      default: 'inactive'
    },
    /**
     * @description 高亮相连节点时是否重置已经选中的节点，默认为 false，即选中的节点状态不会被 activate-relations 覆盖；
     * @default false
     */
    resetSelected: {
      type: Boolean,
      default: false
    },
    /** 是否禁用该功能 */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      type: 'activate-relations',
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