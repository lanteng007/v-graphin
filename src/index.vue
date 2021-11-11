<template>
  <div class="graphin-container">
    <div class="graphin-core" ref="graphDOM"></div>
    <div class="graphin-components" v-if="isReady">
      <!-- 拖拽画布 -->
      <DragCanvas />
      <!-- 缩放画布 -->
      <ZoomCanvas />
       <!-- 拖拽节点 -->
      <DragNode />
       <!-- 点击节点 -->
      <DragCombo />
      <!-- 点击节点 -->
      <ClickSelect />
      <!-- 圈选节点 -->
      <BrushSelect />
      <slot></slot>
    </div>
  </div>
</template>
<script>
/* eslint-disable no-unused-vars */
import G6 from "@antv/g6";
/** 内置API */
import ApiController from "./apis";
/** 内置 Behaviors */
import Behaviors from "./behaviors";

import cloneDeep from "lodash.clonedeep";
import { DEFAULT_TREE_LATOUT_OPTIONS, TREE_LAYOUTS } from "./consts";
/** 内置布局 */
import LayoutController from "./layout";
import { getDefaultStyleByTheme } from "./theme/index";
import deepEqual from "./utils/deepEqual";

// const { DragCanvas, ZoomCanvas, DragNode, DragCombo, ClickSelect, BrushSelect, ResizeCanvas, Hoverable } = Behaviors;


export default {
  name: "VGraphin",
  componentName: "VGraphin",
  components: {
    ...Behaviors
  },
  provide() {
    return {
      graphin: () => this.graphin,
      setGraphinProperty: (property) => {
        this.graphin = {
          ...this.graphin,
          ...property
        }
      }
    };
  },
  props: {
    data: {
      type: Object,
      default() {
        return {};
      },
    },
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      graph: null,
      graphDOM: null,
      layout: {},
      layoutCache: false,
      isTree: false,
      graphData: null,
      theme: {},
      options: {},
      apis: {},
      isReady: false,
      graphin: {
        graph: null,
        layout: {},
        apis: {},
        theme: {},
        graphDOM: null
      }
    };
  },
  created() {
    this.$nextTick(() => {
      this.graphDOM = this.$refs.graphDOM;
      this.initGraphInstance();
    });
  },
  beforeDestroy() {
    this.clear();
  },
  watch: {
    data(newValue, oldValue) {
      const isGraphTypeChange = oldValue.children !== newValue.children;
      if (isGraphTypeChange) {
        console.error(
          "The data types of pervProps.data and props.data are inconsistent,Graphin does not support the dynamic switching of TreeGraph and NetworkGraph"
        );
        return;
      }
      const isDataChange = this.shouldUpdate(oldValue, newValue);
      /** 数据变化 */
      if (isDataChange) {
        this.initData(newValue);
        this.layout.changeLayout();
        this.graph.data(this.graphData);
        this.graph.changeData(this.graphData);
        this.initStatus();
        this.apis = ApiController(this.graph);
        this.setGraphin()
        this.graph.emit('graphin:datachange');
      }
    },
    layout(newValue, oldValue) {
      const isLayoutChange = this.shouldUpdate(oldValue, newValue);
      /** 布局变化 */
      if (isLayoutChange) {
        if (this.isTree) {
          this.graph.updateLayout(this.layout);
          return;
        }
        /**
         * TODO
         * 1. preset 前置布局判断问题
         * 2. enablework 问题
         * 3. G6 LayoutController 里的逻辑
         */
        /** 数据需要从画布中来 */
        // @ts-ignore
        this.graphData = this.layout.getDataFromGraph();
        this.layout.changeLayout();
        this.layout.refreshPosition();

        /** 走G6的layoutController */
        // this.graph.updateLayout();
        // console.log('%c isLayoutChange', 'color:grey');
        this.graph.emit("graphin:layoutchange", {
          prevLayout: oldValue,
          newValue,
        });
      }
    },
    options(newValue, oldValue) {
      const isOptionsChange = this.shouldUpdate(oldValue, newValue);
      /** 配置变化 */
      if (isOptionsChange) {
        // this.updateOptions();
      }
    },
  },
  methods: {
    initGraphInstance() {
      const {
        theme,
        data,
        layout,
        width,
        height,
        defaultCombo = { style: {}, type: "graphin-combo" },
        defaultEdge = { style: {}, type: "graphin-line" },
        defaultNode = { style: {}, type: "graphin-circle" },
        nodeStateStyles,
        edgeStateStyles,
        comboStateStyles,
        modes = { default: [] },
        animate,
        handleAfterLayout,
        ...otherOptions
      } = this;
      if (modes.default.length > 0) {
        // TODO :给用户正确的引导，推荐使用Graphin的Behaviors组件
        console.info(
          "%c suggestion: you can use @antv/graphin Behaviors components",
          "color:lightgreen"
        );
      }
      /**  width and height */
      const { clientWidth, clientHeight } = this.graphDOM;
      /** shallow clone */
      this.initData(data);
      const themeResult = getDefaultStyleByTheme(theme);

      const {
        defaultNodeStyle,
        defaultEdgeStyle,
        defaultComboStyle,
        defaultNodeStatusStyle,
        defaultEdgeStatusStyle,
        defaultComboStatusStyle,
        ...otherTheme
      } = themeResult;
      const finalStyle = {
        defaultNode: {
          style: { ...defaultNode.style, _theme: theme },
          type: defaultNode.type || "graphin-circle",
        }, // isGraphinNodeType ? deepMix({}, defaultNodeStyle, defaultNode) : defaultNode,
        defaultEdge: {
          style: { ...defaultEdge.style, _theme: theme },
          type: defaultEdge.type || "graphin-line",
        }, // isGraphinEdgeType ? deepMix({}, defaultEdgeStyle, defaultEdge) : defaultEdge,
        defaultCombo: {
          style: { ...defaultCombo.style, _theme: theme },
          type: defaultCombo.type || "combo",
        }, // deepMix({}, defaultComboStyle, defaultCombo), // TODO:COMBO的样式需要内部自定义
        /** status 样式 */
        nodeStateStyles, // isGraphinNodeType ? deepMix({}, defaultNodeStatusStyle, nodeStateStyles) : nodeStateStyles,
        edgeStateStyles, // isGraphinEdgeType ? deepMix({}, defaultEdgeStatusStyle, edgeStateStyles) : edgeStateStyles,
        comboStateStyles, // deepMix({}, defaultComboStatusStyle, comboStateStyles),
      };
      this.theme = { ...finalStyle, ...otherTheme };
      /** graph type */
      this.isTree =
        Boolean(data.children) ||
        TREE_LAYOUTS.indexOf(String(layout && layout.type)) !== -1;
      this.options = {
        container: this.graphDOM,
        renderer: "canvas",
        width: Number(width) || clientWidth || 500,
        height: Number(height) || clientHeight || 500,
        animate: animate !== false,
        ...finalStyle,
        modes,
        ...otherOptions,
      };
      if (this.isTree) {
        this.options.layout = layout || DEFAULT_TREE_LATOUT_OPTIONS;
        this.graph = new G6.TreeGraph(this.options);
      } else {
        this.graph = new G6.Graph(this.options);
      }
      /** 内置事件:AfterLayout 回调 */
      this.graph.on("afterlayout", () => {
        if (handleAfterLayout) {
          handleAfterLayout(this.graph);
        }
      });
      /** 装载数据 */
      this.graph.data(this.graphData);
      /** 初始化布局：仅限网图 */
      if (!this.isTree) {
        this.layout = new LayoutController(this);
        this.layout.start();
      }

      // this.graph.get('canvas').set('localRefresh', true);

      /** 渲染 */
      this.graph.render();
      /** FitView 变为组件可选 */

      /** 初始化状态 */
      this.initStatus();
      /** 生成API */
      this.apis = ApiController(this.graph);
      this.setGraphin()
      this.isReady = true
    },
    initData(data) {
      if (data.children) {
        this.isTree = true;
      }
      this.graphData = cloneDeep(data);
    },
    /** 初始化状态 */
    initStatus() {
      if (!this.isTree) {
        const { graphData } = this;
        const { nodes = [], edges = [] } = graphData;
        nodes.forEach((node) => {
          const { status } = node;
          if (status) {
            Object.keys(status).forEach((k) => {
              this.graph.setItemState(node.id, k, Boolean(status[k]));
            });
          }
        });
        edges.forEach((edge) => {
          const { status } = edge;
          if (status) {
            Object.keys(status).forEach((k) => {
              this.graph.setItemState(edge.id, k, Boolean(status[k]));
            });
          }
        });
      }
    },
    /** 布局更新 */
    updateLayout() {
      this.layout.changeLayout();
    },
    /**
     * 组件更新的时候
     * @param prevProps
     */
    updateOptions() {
      const { ...options } = this;
      return options;
    },
    clear() {
      if (this.layout && this.layout.destroy) {
        this.layout.destroy(); // tree graph
      }
      this.layout = {};
      if (this.graph) {
        this.graph.clear();
      }
      this.graphData = { nodes: [], edges: [], combos: [] };
      if (this.graph) {
        this.graph.destroy();
      }
    },

    shouldUpdate(prevVal, currentVal) {
      const isEqual = deepEqual(prevVal, currentVal);
      return !isEqual;
    },
    setGraphin() {
      this.graphin = {
        graph: this.graph,
        layout: this.layout,
        apis: this.apis,
        theme: this.theme,
        graphDOM: this.graphDOM
      }
    }
  },
};
</script>
<style lang="scss" scoped>
.graphin-container {
  width: 100%;
  height: 100%;
  position: relative;
  .graphin-core {
    width: 100%;
    height: 100%;
    min-height: 500px;
    background: #f2f2f2;
  }
}
</style>