export default {
  name: 'ZoomCanvas',
  inject: ['graphin'],
  props: {
    /** 缩放灵敏度，支持 1-10 的数值，默认灵敏度为 5； */
    sensitivity: {
      type: Number,
      default: 2,
    },
    /** 最小缩放比例 */
    minZoom: {
      type: Number,
      default: undefined,
    },
    /** 最大缩放比例 */
    maxZoom: {
      type: Number,
      default: undefined,
    },
     /** 是否开启性能优化，默认为 false，设置为 true 开启，开启后缩放比例小于 optimizeZoom 时自动隐藏非 keyShape */
    enableOptimize: {
      type: Boolean,
      default: false,
    },
    /** 当 enableOptimize 为 true 时起作用，默认值为 0.7，表示当缩放到哪个比例时开始隐藏非 keyShape； */
    optimizeZoom: {
      type: Number,
      default: 0.1,
    },
    /** 在缩小画布时是否固定选定元素的描边粗细、文本大小、整体大小等，fixSelectedItems 是一个对象，有以下变量： */
    fixSelectedItems: { 
      type: Object,  
      default() { 
        return {
          /** 固定元素的整体大小，优先级高于 fixSelectedItems.fixLineWidth 和 fixSelectedItems.fixLabel； */
          fixAll: false,
          /** 固定元素的 keyShape 的描边粗细； */
          fixLineWidth: false,
          /** 固定元素的文本大小。 */
          fixLabel: false,
          /** 将被固定的元素状态，被设置为该状态的节点将会在画布缩小时参与固定大小的计算，默认为 'selected'； */
          fixState: 'selected',
        }
      }
    },
    /** 是否禁用该功能 */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      type: 'zoom-canvas',
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
    const { type, sensitivity, minZoom, maxZoom, enableOptimize, optimizeZoom, fixSelectedItems } = this
    const config = {
      type,
      sensitivity,
      minZoom,
      maxZoom,
      enableOptimize,
      optimizeZoom,
      fixSelectedItems
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