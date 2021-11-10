export default {
  name: 'ClickSelect',
  inject: ['graphin'],
  props: {
    /** 选中的状态，默认值为 'selected' */
    selectedState: {
      type: String,
      default: 'selected',
    },
    /** 指定按住哪个键进行多选，默认为 shift，按住 Shift 键多选，用户可配置 shift、ctrl、alt； */
    trigger:{
      type: String,
      default: 'shift',
    },
    /** 是否允许多选，默认为 true，当设置为 false，表示不允许多选，此时 trigger 参数无效； */
    multiple: {
      type: Boolean,
      default: true,
    },
    /** 是否禁用该功能 */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      type: 'click-select',
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