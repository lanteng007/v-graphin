
import G6 from '@antv/g6';
import defaultOptions from './utils/options';
import Tweak from './inner/tweak';

const isEmpty = (data) => {
  if (data && data.nodes && data.nodes.length !== 0) {
    return false;
  }
  return true;
};
const FORCE_LAYOUTS = ['force', 'graphin-force', 'g6force', 'gForce', 'comboForce'];
class LayoutController {
  
  graph;

  graphin;

  // eslint-disable-next-line 
  presetLayout;

  // eslint-disable-next-line 
  prevOptions;

  // eslint-disable-next-line 
  options;

  // eslint-disable-next-line 
  instance;

  constructor(context) {
    this.graphin = context;
    this.graph = this.graphin.graph;
    this.presetLayout = null;
    this.prevOptions = {};
    this.init();
  }

  // 是否每个节点都有位置信息
  hasPosition() {
    const { graphin } = this;
    const { graphData = {} } = graphin;
    return graphData.nodes.every(node => !window.isNaN(Number(node.x)) && !window.isNaN(Number(node.y)));
  }

  /**
   * 初始化布局
   */
  init() {
    /** 更新布局参数 */
    this.updateOptions();
    const { options, graphin } = this;
    const { graphData } = graphin;
    const { type } = options;

    /** 力导布局特殊处理 */
    this.processForce();

    if (!G6.Layout[type]) {
      console.warn(`${type} layout not found, current layout is grid`);
    }
    const LayoutClass = G6.Layout[type] || G6.Layout.grid;
    this.graph.emit('beforelayout');

    this.instance = new LayoutClass(this.options);
    this.instance.init(graphData);
  }

  /** 启动布局 */
  start() {
    this.instance.execute();
    this.graph.emit('afterlayout');
  }

  /** 重新布局 */
  changeLayout() {
    const { graph, graphData, isTree, layoutCache } = this.graphin;
    if (
      !graph ||
      graph.destroyed ||
      !graphData ||
      !graphData.nodes ||
      !graphData.nodes.length ||
      (layoutCache && this.hasPosition()) ||
      isTree
    ) {
      return false;
    }
    if (FORCE_LAYOUTS.indexOf(this.options.type) !== -1) {
      this.destroy();
    }
    /** 设置前置布局参数 */
    this.prevOptions = { ...this.options };
    /** 重新走初始化流程 */
    this.init();
    this.start();
  }

  /** 更新布局参数 */
  updateOptions = () => {
    const DEFAULT_LAYOUT = {
      type: 'concentric',
    };
    const { width, height, layout = DEFAULT_LAYOUT } = this.graphin;
    // const { layout = DEFAULT_LAYOUT } = props;
    /** 如果数据为空，不进行布局 */

    const { type = 'concentric', preset } = layout;

    /** 通用布局参数 */
    const commonLayoutParams = {
      width,
      height,
      center: [width / 2, height / 2],
    };
    /**  */

    this.options = {
      ...commonLayoutParams,
      // Graphin配置的最佳Options
      ...(defaultOptions[type] || {}),
      ...layout,
    };

    if (isEmpty(this.graphin.graphData)) {
      this.prevOptions = {};
      return;
    }

    /** 力导布局有前置布局的概念，特殊处理 */
    if (FORCE_LAYOUTS.indexOf(type) !== -1) {
      // 布局切换产生的prevType 是最低优先级
      let presetType = this.prevOptions.type || 'grid';
      if (preset.type) {
        // 用户给的preset.type是第一优先级
        presetType = preset.type;
      }
      if (isEmpty(this.graphin.graphData)) {
        // 特殊场景处理，不带preset的力导，第二次渲染
        presetType = preset.type || 'grid';
      }

      this.options.preset = {
        type: presetType,
        ...commonLayoutParams,
        // Graphin配置的最佳Options
        ...(defaultOptions[presetType] || {}),
        ...preset,
      };
    }
  };

  processForce = () => {
    const { options, graphin } = this;
    const { graph } = graphin;
    const { type } = options;

    if (type === 'graphin-force') {
      this.options.graph = this.graph;
    }

    if (type === 'force' || type === 'g6force' || type === 'gForce') {
      const { onTick } = this.options;
      const tick = () => {
        if (onTick) {
          onTick();
        }

        graph.refreshPositions();
      };

      this.options.tick = tick;
      const { onLayoutEnd } = this.options;
      this.options.onLayoutEnd = () => {
        if (onLayoutEnd) {
          onLayoutEnd();
        }
        graph.emit('afterlayout');
      };
    }
    if (this.type === 'comboForce') {
      this.options.comboTrees = graph.get('comboTrees');
    }

    const isForceLayout = {
      prev: FORCE_LAYOUTS.indexOf(this.prevOptions.type) !== -1,
      current: FORCE_LAYOUTS.indexOf(this.options.type) !== -1,
    };
    const isSameLayoutType = this.options.type === this.prevOptions.type;
    if (isEmpty(graphin.graphData)) {
      return;
    }

    if (isForceLayout.current && !isSameLayoutType) {
      /**
       * 当前布局为force，且两次布局类型不一致
       * 应当设置当前布局的preset为前一个布局
       */

      const { preset } = this.options;
      this.presetLayout = new G6.Layout[preset.type]({ ...preset } || {});
      this.presetLayout.init(graphin.graphData);
      this.presetLayout.execute();
      this.presetLayout.graphData = { ...graphin.graphData };
    }

    if (isForceLayout.current && isForceLayout.prev && !this.hasPosition()) {
      /**
       * 当前布局类型为force， 前一次布局也为force
       * 渐进布局
       * 不满足每个节点都有位置信息时才计算初始位置
       */
      let prevData = this.graph.save(); // 必须从graph上取数据的原因是，用户可能拖拽改变数据
      const { preset } = this.options;
      if (isEmpty(prevData)) {
        // preset.type = 'grid';
        this.presetLayout = new G6.Layout[preset.type]({ ...preset } || {});
        this.presetLayout.init(graphin.graphData);
        this.presetLayout.execute();
        prevData = graphin.graphData;
      }
      graphin.graphData = Tweak(graphin.graphData, prevData);
    }

    /** 布局切换 */
  };

  refreshPosition = () => {
    const { animate } = this.graphin.options;

    if (animate) {
      this.graph.positionsAnimate();
    } else {
      this.graph.refreshPositions();
    }
  };

  destroy = () => {
    if (this.presetLayout && this.presetLayout.destroy) {
      this.presetLayout.destroy();
    }
    if (this.instance && this.instance.destroy) {
      this.instance.destroy();
    }

    this.presetLayout = null;
    this.instance = null;
  };

  getDataFromGraph = () => {
    const nodes = [];
    const edges = [];
    const combos = [];
    const nodeItems = this.graph.getNodes();
    const edgeItems = this.graph.getEdges();
    const comboItems = this.graph.getCombos();
    const nodeLength = nodeItems.length;

    for (let i = 0; i < nodeLength; i++) {
      const nodeItem = nodeItems[i];
      if (nodeItem && nodeItem.isVisible()) {
        const model = nodeItem.getModel();
        nodes.push(model);
      }
    }

    const edgeLength = edgeItems.length;
    for (let i = 0; i < edgeLength; i++) {
      const edgeItem = edgeItems[i];
      if (edgeItem && edgeItem.isVisible()) {
        const model = edgeItem.getModel();
        if (!model.isComboEdge) {
          edges.push(model);
        }
      }
    }

    const comboLength = comboItems.length;
    for (let i = 0; i < comboLength; i++) {
      const comboItem = comboItems[i];
      if (comboItem && comboItem.isVisible()) {
        const model = comboItem.getModel();
        combos.push(model);
      }
    }
    return { nodes, edges, combos };
  };

  /** restart */
}

export default LayoutController;
