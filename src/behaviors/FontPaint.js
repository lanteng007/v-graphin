export default {
  name: 'FontPaint',
  inject: ['graphin'],
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
  created() {
    this.timer = setTimeout(() => {
      this.graph.getNodes().forEach((node) => {
        this.graph.setItemState(node, 'normal', true);
      });
      this.graph.paint();
    }, 1600);
  },
  beforeDestroy() {
    clearTimeout(this.timer);
  },
  render: () => {}
}