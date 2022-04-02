export default {
  name: 'DragNodeWithForce',
  inject: ['graphin','updateDragNodes'],
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
    dragNodeMass: {
      type: Number,
      default: 10000000000
    }

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
    dragNodes() {
      return this.graphin.dragNodes
    }
  },
  methods: {
    handleNodeDragStart() {
      const { instance } = this.layout;
      const { simulation } = instance;
      if (simulation) {
        simulation.stop();
      }
    },
    handleNodeDragEnd(e) {
      const { instance } = this.layout;
      const { type } = instance;
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
            mass: this.autoPin ? this.dragNodeMass : null,
          },
        };
        const selectedNodes = [];
        this.graph.getNodes().forEach(node => {
          if (node.hasState('selected')) {
            const selectNodeModel = node.get('model');
            selectNodeModel.layout.force = {
              mass: this.autoPin ? this.dragNodeMass : null,
            };
            selectedNodes.push(selectNodeModel);
          }
        });
        let newDragNodes = this.dragNodes.concat([nodeModel]);
        // 多选拖动的场景
        if (selectedNodes.length > 1) {
          newDragNodes = newDragNodes.concat(selectedNodes);
        }
        this.updateDragNodes(newDragNodes);
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