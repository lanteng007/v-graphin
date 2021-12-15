import Vector from './Vector';
import Point from './Point';
import { Node, Edge } from './Elements';
import Spring from './Spring';
import Utils from '../utils/graph';
import { forceNBody } from './ForceNBody';


class ForceLayout {
  props; // eslint-disable-line

  sourceData;

  nodes;

  edges;

  nodeSet;

  edgeSet;

  renderNodes;

  nodePoints;

  edgeSprings;

  // eslint-disable-next-line 
  registers;

  done;

  iterations;

  nextEdgeId;

  timer;

  /** 向心力的中心点 */
  center;

  /** 距离的总和 */
  averageDistance;

  constructor(options) {
    this.props = {
      stiffness: 200.0,
      enableWorker: false,
      defSpringLen: edge => {
        return edge.data.spring || 200;
      },
      repulsion: 200.0 * 5,
      centripetalOptions: {
        leaf: 2,
        single: 2,
      },
      leafCluster: false,
      nodeClusterBy: 'cluster',
      clusterNodeStrength: 20,
      damping: 0.9,
      minEnergyThreshold: 0.1,
      maxSpeed: 1000,
      coulombDisScale: 0.005,
      tickInterval: 0.02,
      groupFactor: 4,
      /** 浏览器16ms刷新一次，1min = 1 * 60s = 1 * 60 * 1000ms = 1 * 60 * (1000ms / 16ms)次 = 3750次 */
      maxIterations: 7440,
      minDistanceThreshold: 0.4,
      animation: true,
      restartAnimation: true,
      width: 200,
      height: 200,
    };
    this.updateOptions(options);
    /** 存放器：节点与边 */
    this.sourceData = {
      nodes: [],
      edges: [],
      combos: [],
    };
    this.nodes = [];
    this.edges = [];
    this.nodeSet = {};
    this.edgeSet = {};
    this.renderNodes = [];
    this.nodePoints = new Map();
    this.edgeSprings = new Map();
    this.registers = new Map();
    this.done = false;
    this.averageDistance = 0;

    /** 计数器 */
    this.iterations = 0;
    this.nextEdgeId = 0; // 边属性计数自增
    this.timer = 0;
    this.center = new Vector(0, 0);
  }

  /**
   * Iterate options to update this.props
   * @param {*} options
   */
  updateOptions = (options) => {
    if (!options) {
      return;
    }
    Object.keys(options).forEach(key => {
      this.props[key] = options[key];
    });
  };

  setData = (data) => {
    // clean all data
    this.nodes = [];
    this.edges = [];
    this.nodeSet = {};
    this.edgeSet = {};
    this.nodePoints = new Map();
    this.edgeSprings = new Map();
    this.sourceData = data;
    this.averageDistance = 0;

    // add nodes and edges
    if ('nodes' in data || 'edges' in data) {
      this.addNodes(data.nodes);
      // eslint-disable-next-line
      this.addEdges(data.edges);
    }
  };

  getMass = (node) => {
    const {
      degree = Utils.getDegree(node, this.edges) ? Utils.getDegree(node, this.edges).degree : undefined, // 节点度数
      force,
    } = node.layout || {};

    /** 当你在layout.force.mass中制定了才使用 */
    if (force && force.mass) {
      // eslint-disable-next-line prefer-destructuring
      return force.mass;
    }
    /** 默认质量都是通过节点的度数自动计算的 */
    return degree < 5 ? 1 : degree * 5;
  };

  init = () => {
    /** 初始化点和边的信息 */
    const { width, height } = this.props;

    this.nodes.forEach(node => {
      const x = node.data.x || width / 2;
      const y = node.data.y || height / 2;
      const vec = new Vector(x, y);

      if (!node.data.layout) {
        node.data.layout = {};
      }
      const degreeInfo = Utils.getDegree(node, this.edges);
      node.data.layout = {
        ...node.data.layout,
        ...degreeInfo,
      };

      const mass = this.getMass(node.data);

      this.nodePoints.set(node.id, new Point(vec, String(node.id), node.data, mass));
    });

    this.edges.forEach(edge => {
      const source = this.nodePoints.get(edge.source.id);
      const target = this.nodePoints.get(edge.target.id);
      const length = this.props.defSpringLen(edge, source, target);

      this.edgeSprings.set(edge.id, new Spring(source, target, length));
    });

    /** 其他参数设置 */
    const { size } = this.nodePoints;
    const vv = Math.pow(10, 2);
    this.props.minEnergyThreshold = (1 / 2) * Math.pow(1, 2) * 1 * size * vv;
  };

  start = () => {
    /** 初始化节点 */
    this.init();
    if (this.props.animation) this.animation();
    else this.slienceForce();
  };

  calTotalEnergy = () => {
    let energy = 0.0;

    this.nodes.forEach(node => {
      const point = this.nodePoints.get(node.id);
      const speed = point.v.magnitude();

      const { m } = point; // 1;
      energy += m * Math.pow(speed, 2) * 0.5; // p = 1/2*(mv^2)
    });

    return energy;
  };

  slienceForce = () => {
    const { done, maxIterations, minDistanceThreshold } = this.props;
    for (let i = 0; (this.averageDistance > minDistanceThreshold || i < 1) && i < maxIterations; i++) {
      this.tick(this.props.tickInterval);
      this.iterations++;
    }
    this.render();
    if (done) {
      done(this.renderNodes);
    }
  };

  /** polyfill: support webworker requestAnimationFrame */
  // eslint-disable-next-line 
  requestAnimationFrame = (fn) => {
    const { enableWorker } = this.props;
    if (enableWorker) {
      return setInterval(() => {
        fn();
      }, 16);
    }
    return window.requestAnimationFrame(fn);
  };

  cancelAnimationFrame = (handleId) => {
    const { enableWorker } = this.props;
    if (enableWorker) {
      clearInterval(handleId);
    } else {
      window.cancelAnimationFrame(handleId);
    }
  };

  animation = () => {
    const { enableWorker, maxIterations, minDistanceThreshold, done, tickInterval } = this.props;
    if (enableWorker) {
      let startTimer = new Date().valueOf();
      const firstTickInterval = 0.22;
      const interval = (step) => {
        // 目标：迭代10次，稳定在2s，函数选择需要后续考虑
        return step > 10 ? 2000 : 20 * step * step;
      };
      for (let i = 0; i < maxIterations; i++) {
        const tickInterval = Math.max(0.02, firstTickInterval - i * 0.002);
        this.tick(tickInterval);
        const diff = new Date().valueOf() - startTimer;
        if (diff >= interval(i)) {
          this.render();
          startTimer = new Date().valueOf();
        }
        const energy = this.calTotalEnergy();
        /** 如果需要监控信息，则提供给用户 */
        const monitor = this.registers.get('monitor');
        if (monitor) {
          monitor(this.reportMointor(energy));
        }

        if (this.averageDistance < minDistanceThreshold) {
          this.render();
          if (done) {
            done(this.renderNodes);
          }
          return;
        }
      }
      return;
    }
    const step = () => {
      this.tick(tickInterval);

      this.render();

      this.iterations++;
      const energy = this.calTotalEnergy();

      /** 如果需要监控信息，则提供给用户 */
      const monitor = this.registers.get('monitor');
      if (monitor) {
        monitor(this.reportMointor(energy));
      }

      // console.log('average', this.averageDistance);
      if (this.averageDistance < minDistanceThreshold || this.iterations > this.props.maxIterations) {
        this.cancelAnimationFrame(this.timer);
        this.iterations = 0;
        this.done = true;
        if (done) {
          done(this.renderNodes);
        }
      } else {
        this.timer = this.requestAnimationFrame(step);
      }
    };
    this.timer = this.requestAnimationFrame(step);
  };

  render = () => {
    const render = this.registers.get('render');
    this.nodePoints.forEach(node => {
      this.renderNodes.push({
        ...(this.nodeSet[node.id] && this.nodeSet[node.id].data),
        x: node.p.x,
        y: node.p.y,
      });
    });

    if (render) {
      render({
        nodes: this.renderNodes,
        edges: this.sourceData.edges,
      });
    } else {
      // eslint-disable-next-line no-console
      console.error('need a render function');
    }
  };

  reportMointor = (energy) => {
    const params = {
      energy,
      iterations: this.iterations,
      nodes: this.nodes,
      edges: this.edges,
      // memory: window.performance && window.performance.memory && window.performance.memory.usedJSHeapSize,
    };

    return params;
  };

  tick = (interval) => {
    // this.updateCoulombsLaw();
    this.updateCoulombsLawOptimized();
    this.updateHookesLaw();
    this.attractToCentre();
    this.updateVelocity(interval);
    this.updatePosition(interval);
  };

  /** 布局算法 */
  updateCoulombsLawOptimized = () => {
    // 用force-n-body结合 Barnes-Hut approximation 优化的方法
    const { coulombDisScale } = this.props;
    const { repulsion } = this.props;
    const nodes = this.nodes.map(n => {
      const point = this.nodePoints.get(n.id).p;
      return {
        x: point.x,
        y: point.y,
      };
    });
    const forces = forceNBody(nodes, coulombDisScale, repulsion);
    this.nodes.forEach((node, i) => {
      this.nodePoints.get(node.id).updateAcc(new Vector(forces[i].vx, forces[i].vy));
    });
  };

  updateCoulombsLaw = () => {
    const len = this.nodes.length;

    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        // eslint-disable-next-line no-continue
        if (i === j) continue;
        const iNode = this.nodes[i];
        const jNode = this.nodes[j];

        const { coulombDisScale } = this.props;
        const { repulsion } = this.props;
        const v = this.nodePoints.get(iNode.id).p.subtract(this.nodePoints.get(jNode.id).p);
        const dis = (v.magnitude() + 0.1) * coulombDisScale;
        const direction = v.normalise(); // 向量的方向：基向量
        const factor = 1;

        this.nodePoints.get(iNode.id).updateAcc(
          // 得到库伦力
          direction.scalarMultip(repulsion * factor).divide(Math.pow(dis, 2)),
        );
        this.nodePoints.get(jNode.id).updateAcc(direction.scalarMultip(repulsion * factor).divide(-Math.pow(dis, 2)));
      }
    }
  };

  updateHookesLaw = () => {
    this.edges.forEach(edge => {
      const spring = this.edgeSprings.get(edge.id);
      const v = spring.target.p.subtract(spring.source.p);
      const displacement = spring.length - v.magnitude();
      const direction = v.normalise();

      spring.source.updateAcc(direction.scalarMultip(-this.props.stiffness * displacement));
      spring.target.updateAcc(direction.scalarMultip(this.props.stiffness * displacement));
    });
  };

  attractToCentre = () => {
    const implementForce = (node, center, radio = 2) => {
      const point = this.nodePoints.get(node.id);
      const direction = point.p.subtract(center);

      point.updateAcc(direction.scalarMultip(-radio));
    };
    this.nodes.forEach(node => {
      // 默认的向心力指向画布中心
      /** 默认的向心力配置 */
      const defaultRadio = {
        leaf: 2,
        single: 2,
        others: 1,
        // eslint-disable-next-line
        center: (_node) => {
          return {
            x: this.props.width / 2,
            y: this.props.height / 2,
          };
        },
      };

      // const degree = node.data && node.data.layout ? node.data.layout.degree : undefined;
      const { degree, sDegree, tDegree } = node.data.layout;
      let { centripetalOptions } = this.props;
      const { leafCluster, nodeClusterBy, clusterNodeStrength } = this.props;
      // 如果传入了需要叶子节点聚类
      if (leafCluster) {
        centripetalOptions = {
          single: 100,
          leaf: (node, nodes, edges) => {
            const relativeNodesType = Utils.getRelativeNodesType(nodes, nodeClusterBy);
            // 找出与它关联的边的起点或终点出发的所有一度节点中同类型的叶子节点
            const { relativeLeafNodes, sameTypeLeafNodes } = Utils.getCoreNodeAndRelativeLeafNodes(
              'leaf',
              node,
              edges,
              nodeClusterBy,
            );
            // 如果都是同一类型或者每种类型只有1个，则施加默认向心力
            if (sameTypeLeafNodes.length === relativeLeafNodes.length || relativeNodesType.length === 1) {
              return 1;
            }
            return clusterNodeStrength;
          },
          others: 1,
          center: (node, nodes, edges) => {
            const { degree } = node.data.layout || {};
            // 孤点默认给1个远离的中心点
            if (!degree) {
              return {
                x: 100,
                y: 100,
              };
            }
            let centerNode;
            if (degree === 1) {
              // 如果为叶子节点
              // 找出与它关联的边的起点出发的所有一度节点中同类型的叶子节点
              const { sameTypeLeafNodes } = Utils.getCoreNodeAndRelativeLeafNodes('leaf', node, edges, nodeClusterBy);
              if (sameTypeLeafNodes.length === 1) {
                // 如果同类型的叶子节点只有1个，中心节点置为undefined
                centerNode = undefined;
              } else if (sameTypeLeafNodes.length > 1) {
                // 找出同类型节点平均位置节点的距离最近的节点作为中心节点
                centerNode = Utils.getMinDistanceNode(sameTypeLeafNodes);
              }
            } else {
              centerNode = undefined;
            }
            return {
              x: centerNode.x,
              y: centerNode.y,
            };
          },
        };
      }
      const {
        leaf: propsLeaf,
        single: propsSingle,
        others: propsOthers,
        center,
      } = { ...defaultRadio, ...centripetalOptions };
      const { width, height } = this.props;
      const { x, y } = center(node, this.nodes, this.edges, width, height);
      const leaf = typeof propsLeaf === 'function' ? propsLeaf(node, this.nodes, this.edges) : propsLeaf;
      const single = typeof propsSingle === 'function' ? propsSingle(node) : propsSingle;
      const others = typeof propsOthers === 'function' ? propsOthers(node) : propsOthers;
      const centerVector = new Vector(x, y);
      // 没有出度或没有入度，都认为是叶子节点
      const leafNode = tDegree === 0 || sDegree === 0;
      const singleNode = degree === 0;
      /** 如果radio为0，则认为忽略向心力 */
      if (leaf === 0 || single === 0 || others === 0) {
        return;
      }
      if (singleNode) {
        implementForce(node, centerVector, single);
        return;
      }

      if (leafNode) {
        implementForce(node, centerVector, leaf);
        return;
      }
      /** others */
      implementForce(node, centerVector, others);
    });
  };

  updateVelocity = (interval) => {
    this.nodes.forEach(node => {
      const point = this.nodePoints.get(node.id);
      point.v = point.v
        .add(point.a.scalarMultip(interval)) // 根据加速度求速度公式 V_curr= a*@t + V_pre
        .scalarMultip(this.props.damping);

      if (point.v.magnitude() > this.props.maxSpeed) {
        point.v = point.v.normalise().scalarMultip(this.props.maxSpeed);
      }
      point.a = new Vector(0, 0);
    });
  };

  updatePosition = (interval) => {
    let sum = 0;
    this.nodes.forEach(node => {
      const point = this.nodePoints.get(node.id);
      const distance = point.v.scalarMultip(interval);
      sum = sum + distance.magnitude();
      point.p = point.p.add(point.v.scalarMultip(interval)); // 路程公式 s = v * t
    });
    this.averageDistance = sum / this.nodes.length;
  };

  /**
   * add one Node
   * @param {[type]} node [description]
   */
  addNode = (node) => {
    const { ignore } = this.props;
    if (ignore && ignore(node)) {
      return;
    }
    if (!(node.id in this.nodeSet)) {
      this.nodes.push(node);
    }
    this.nodeSet[node.id] = node;
  };

  /**
   * add Nodes
   * @param {[type]} data [description]
   */
  addNodes = (data) => {
    data.forEach(node => {
      this.addNode(new Node(node));
    });
  };

  /**
   * add one Edge
   * @param {[type]} edge [description]
   */
  addEdge = (edge) => {
    if (!(edge.id in this.edgeSet)) {
      this.edges.push(edge);
    }

    this.edgeSet[edge.id] = edge;
    return edge;
  };

  /**
   * add Edges
   * @param {[type]} data [description]
   */
  addEdges = (data) => {
    try {
      const len = data.length;
      for (let i = 0; i < len; i++) {
        const e = data[i];

        const sourceId = e.source;
        const targetId = e.target;

        // eslint-disable-next-line
        const node1 = this.nodeSet[sourceId];
        if (node1 === undefined) {
          throw new TypeError(`invalid node name: ${e.source}`);
        }

        // eslint-disable-next-line
        const node2 = this.nodeSet[targetId];
        if (node2 === undefined) {
          throw new TypeError(`invalid node name: ${e.target}`);
        }
        const attr = e.data;

        const edge = new Edge(String(this.nextEdgeId++), node1, node2, attr);
        this.addEdge(edge);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // eslint-disable-next-line 
  register = (type, options) => {
    this.registers.set(type, options); // 将用户的自定义函数注册进来
  };

  restart = (dragNode, graph) => {
    /** 将位置更新到nodePoint中 */
    const { ignore } = this.props;
    graph.getNodes().forEach((nodeItem) => {
      const node = nodeItem.get('model');

      if (ignore && ignore(node)) {
        return;
      }
      const vec = new Vector(node.x, node.y);
      const point = this.nodePoints.get(node.id);
      if (point) {
        point.p = vec;
        this.nodePoints.set(node.id, point);
      }
    });

    const changeNodePosition = (node) => {
      const vec = new Vector(node.x, node.y);
      // const mass = (node.layout && node.layout.force && node.layout.force.mass) || 100000;
      const mass = this.getMass(node);
      this.nodePoints.set(node.id, new Point(vec, node.id, node.data, mass));

      this.edges.forEach(edge => {
        const source = this.nodePoints.get(edge.source.id);
        const target = this.nodePoints.get(edge.target.id);
        if (source.id === node.id || target.id === node.id) {
          const length = this.edgeSprings.get(edge.id).length || 100;
          this.edgeSprings.set(edge.id, new Spring(source, target, length));
        }
      });
    };

    // TODO:支持多点拖拽
    dragNode.forEach(changeNodePosition);

    if (this.props.restartAnimation) this.animation();
    else this.slienceForce();
  };

  stop = () => {
    window.cancelAnimationFrame(this.timer);
    this.done = true;
  };
}

export default ForceLayout;
