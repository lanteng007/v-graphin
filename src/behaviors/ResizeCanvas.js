import { debounce } from '@antv/util';

export default {
  name: 'ResizeCanvas',
  inject: ['graphin'],
  computed: {
    graph() {
      return this.graphin().graph || {}
    },
    graphDOM() {
      return this.graphin().graphDOM || {}
    }
  },
  created() {
    window.addEventListener('resize', this.handleResizeEvent, false);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResizeEvent, false);
  },
  methods: {
    handleResizeEvent: debounce(function(){
      const { clientWidth, clientHeight } = this.graphDOM;
      this.graph.set('width', clientWidth);
      this.graph.set('height', clientHeight);
      const canvas = this.graph.get('canvas');
      if (canvas) {
        canvas.changeSize(clientWidth, clientHeight);
        this.graph.autoPaint();
      }
    },200)
  },
  render: () => {}
}