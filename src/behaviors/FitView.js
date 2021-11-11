export default {
  name: 'FitView',
  inject: ['graphin'],
  props: {
    /**
     * @description 适配视窗的间距 padding
     * @default [0,0]
     */
    padding: {
      type: Array,
      default() {
        return [0,0]
      }
    },
    /**
     * @description 是否绑定布局变化：即每次布局变化后，都执行FitView操作
     * @default false
     */
    isBindLayoutChange: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      timer: null
    }
  },
  computed: {
    graph() {
      return this.graphin().graph || {}
    },
  },
  methods: {
    handleFitView() {
      this.graph.fitView(this.padding);
    }
  },
  created() {
    this.handleFitView();
    if (this.isBindLayoutChange) {
      this.graph.on('afterlayout', this.handleFitView);
    }
  },
  beforeDestroy() {
    if (this.isBindLayoutChange) {
      this.graph.off('afterlayout', this.handleFitView);
    }
  },
  render: () => {}
}