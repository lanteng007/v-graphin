
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
    // 若收到一个空数组，Array.prototype.every() 方法在一切情况下都会返回 true
    if (!graphData.nodes) {
      return false;
    }
    if (graphData.nodes.length === 0) {
      return false;
    }
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
    const { type } = this.options;
    this.instance.execute();
    if ((type === 'force' || type === 'g6force' || type === 'gForce' || type === 'comboCombined')) {
      return
    }
    this.refreshPosition();
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
      if (preset && preset.type) {
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
    const self = this;
    const { options, graphin } = self;
    const { graph } = graphin;
    const { type } = options;

    if (type === 'graphin-force') {
      self.options.graph = self.graph;
    }

    if (type === 'force' || type === 'g6force' || type === 'gForce' || type === 'comboCombined') {
      const { onTick } = self.options;
      const tick = () => {
        if (onTick) {
          onTick();
        }
      };

      self.options.tick = tick;
      const { onLayoutEnd } = self.options;
      self.options.onLayoutEnd = () => {
        self.refreshPosition();
        if(onLayoutEnd) {
          onLayoutEnd();
        }
        graph.emit('afterlayout');
      };
    }
    if (self.type === 'comboForce' || type === 'comboCombined') {
      self.options.comboTrees = graph.get('comboTrees');
    }

    const isForceLayout = {
      prev: FORCE_LAYOUTS.indexOf(self.prevOptions.type) !== -1,
      current: FORCE_LAYOUTS.indexOf(self.options.type) !== -1,
    };
    const isSameLayoutType = self.options.type === self.prevOptions.type;
    if (isEmpty(graphin.graphData)) {
      return;
    }

    if (isForceLayout.current && !isSameLayoutType) {
      /**
       * 当前布局为force，且两次布局类型不一致
       * 应当设置当前布局的preset为前一个布局
       */

      const { preset } = self.options;
      self.presetLayout = new G6.Layout[preset.type]({ ...preset } || {});
      self.presetLayout.init(graphin.graphData);
      self.presetLayout.execute();
      self.presetLayout.graphData = { ...graphin.graphData };
    }

    if (isForceLayout.current && isForceLayout.prev && !self.hasPosition()) {
      /**
       * 当前布局类型为force， 前一次布局也为force
       * 渐进布局
       * 不满足每个节点都有位置信息时才计算初始位置
       */
      let prevData = self.graph.save(); // 必须从graph上取数据的原因是，用户可能拖拽改变数据
      const { preset } = self.options;
      if (isEmpty(prevData)) {
        // preset.type = 'grid';
        self.presetLayout = new G6.Layout[preset.type]({ ...preset } || {});
        self.presetLayout.init(graphin.graphData);
        self.presetLayout.execute();
        prevData = graphin.graphData;
      }
      graphin.graphData = Tweak(graphin.graphData, prevData);
    }

    /** 布局切换 */
  };

  refreshPosition = () => {
    const { graph, graphin } = this;
    const { animate, layoutAnimate } = graphin.options;
    const { type } = this.options;

    if (animate || layoutAnimate) {
      graph.positionsAnimate(type === 'comboCombined');
    } else {
      graph.refreshPositions(type === 'comboCombined');
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
    const comboEdges = [];
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
        } else {
          comboEdges.push(model);
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
    return { nodes, edges, combos, comboEdges };
  };

  /** restart */
}

export default LayoutController;
