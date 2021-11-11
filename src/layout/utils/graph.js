const getDegree = (node, edges) => {
  const nodeId = node.id;
  let degree = 0;
  let sDegree = 0;
  let tDegree = 0;

  edges.forEach(edge => {
    if (edge.source.id === nodeId) {
      sDegree += 1;
      degree += 1;
    }
    if (edge.target.id === nodeId) {
      tDegree += 1;
      degree += 1;
    }
  });

  return {
    degree,
    sDegree,
    tDegree,
  };
};

// 获取关联节点的类型信息
export const getRelativeNodesType = (nodes, nodeClusterBy) => {
  return [...new Set(nodes.map(node => node.data[nodeClusterBy]))] || [];
};

// 找出指定节点关联的边的起点或终点
const getCoreNode = (type = 'source' | 'target', node, edges) => {
  if (type === 'source') {
    return edges.find(edge => edge.target.id === node.id).source;
  }
  return edges.find(edge => edge.source.id === node.id).target;
};

// 找出同类型的节点
const getSameTypeNodes = (type = 'leaf' | 'all', nodeClusterBy, node, relativeNodes) => {
  const typeName = node.data[nodeClusterBy] || '';
  let sameTypeNodes = relativeNodes.filter(item => item.data[nodeClusterBy] === typeName) || [];
  if (type === 'leaf') {
    sameTypeNodes = sameTypeNodes.filter(node => node.data.layout.degree === 1);
  }
  return sameTypeNodes;
};

// 找出指定节点为起点或终点的所有一度叶子节点
const getRelativeNodes = (type = 'source' | 'target' | 'both', coreNode, edges) => {
  let relativeNodes = [];
  switch (type) {
    case 'source':
      relativeNodes = edges.filter(edge => edge.source.id === coreNode.id).map(edge => edge.target);
      break;
    case 'target':
      relativeNodes = edges.filter(edge => edge.target.id === coreNode.id).map(edge => edge.source);
      break;
    case 'both':
      relativeNodes = edges
        .filter(edge => edge.source.id === coreNode.id)
        .map(edge => edge.target)
        .concat(edges.filter(edge => edge.target.id === coreNode.id).map(edge => edge.source));
      break;
    default:
      break;
  }
  return relativeNodes;
};

// 找出与指定节点关联的边的起点或终点出发的所有一度叶子节点
const getCoreNodeAndRelativeLeafNodes = (type = 'leaf' | 'all', node, edges, nodeClusterBy) => {
  const { sDegree, tDegree } = node.data.layout || {};
  let coreNode = node;
  let relativeLeafNodes= [];
  if (tDegree === 1) {
    // 如果为只有1条入边的叶子节点，则找出与它关联的边的起点出发的所有一度节点
    coreNode = getCoreNode('source', node, edges);
    relativeLeafNodes = getRelativeNodes('both', coreNode, edges);
  } else if (sDegree === 1) {
    // 如果为只有1条出边的叶子节点，则找出与它关联的边的起点出发的所有一度节点
    coreNode = getCoreNode('target', node, edges);
    relativeLeafNodes = getRelativeNodes('both', coreNode, edges);
  }
  relativeLeafNodes = relativeLeafNodes.filter(node => node.data.layout.degree === 1);
  const sameTypeLeafNodes = getSameTypeNodes(type, nodeClusterBy, node, relativeLeafNodes);
  return { coreNode, relativeLeafNodes, sameTypeLeafNodes };
};

export const getMinDistanceNode = (sameTypeLeafNodes) => {
  const xInfo = sameTypeLeafNodes.map(item => item.x);
  const yInfo = sameTypeLeafNodes.map(item => item.y);
  const avgX = (Math.max.apply(null, xInfo) + Math.min.apply(null, xInfo)) / 2;
  const avgY = (Math.max.apply(null, yInfo) + Math.min.apply(null, yInfo)) / 2;
  // 计算节点和同类型节点平均位置节点的距离
  const getDistance = (x, y) => {
    return Math.sqrt((x - avgX) * (x - avgX) + (y - avgY) * (y - avgY));
  };
  const distanceInfo = sameTypeLeafNodes.map(item => getDistance(item.x || 0, item.y || 0));
  // 找出同类型节点平均位置节点的距离最近的节点
  return sameTypeLeafNodes[distanceInfo.findIndex(item => item === Math.min.apply(null, distanceInfo))];
};

export default {
  getDegree,
  getRelativeNodesType,
  getCoreNodeAndRelativeLeafNodes,
  getCoreNode,
  getSameTypeNodes,
  getMinDistanceNode,
};
