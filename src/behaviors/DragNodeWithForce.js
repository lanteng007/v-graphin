export default {
  name: 'DragNodeWithForce',
  inject: ['graphin'],
  props: {
    /**
     * @description 被拖拽的节点，是否自动固定住
     * @description.en-US Whether the dragged node is automatically fixed
     * @default false
     */
    autoPin: {
      type: Boolean,
      default: false
    },

  },
  data() {
    return {
      timer: null
    }
  },
  computed: {
    graph() {
      return this.graphin.graph || {}
    },
    layout() {
      return this.graphin.curlayout || {}
    },
  },
  methods: {
    handleNodeDragStart() {
      const { instance } = this.layout;
      const { simulation } = instance;
      console.log('drag-start', instance);
      if (simulation) {
        simulation.stop();
      }
    },
    handleNodeDragEnd(e) {
      const { instance } = this.layout;
      const { simulation, type } = instance;
      console.log(type)
      if (type !== 'graphin-force') {
        return;
      }

      if (e.item) {
        const nodeModel = e.item.get('model');
        nodeModel.x = e.x;
        nodeModel.y = e.y;
        nodeModel.layout = {
          ...nodeModel.layout,
          force: {
            mass: this.autoPin ? 1000000 : null,
          },
        };
        const drageNodes = [nodeModel];
        simulation.restart(drageNodes, this.graph);
        this.graph.refreshPositions();
      }
    }
  },
  created() {
    this.graph.on('node:dragstart', this.handleNodeDragStart);
    this.graph.on('node:dragend', this.handleNodeDragEnd);
  },
  beforeDestroy() {
    this.graph.off('node:dragstart', this.handleNodeDragStart);
    this.graph.off('node:dragend', this.handleNodeDragEnd);
  },
  render: () => {}
}