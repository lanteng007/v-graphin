

// export interface Node {
//   id: string;
//   parent?: Node;
//   data?: any; // eslint-disable-line
//   children: Node[];
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   [key: string]: any;
// }



export default class Tree {
  root;

  nodeIds;

  constructor(root) {
    // Pass in the root of an existing tree
    if (root) this.root = root;
  }

  bfs = cb => {
    if (!this.root) {
      return;
    }

    const queue = [];

    queue.push(this.root);
    while (queue.length) {
      const node = queue.shift();
      if (cb(node)) {
        return node;
      }
      if (node?.children?.length) {
        queue.push(...node.children);
      }
    }
  };

  getRoot = () => {
    return this.root;
  };

  getNode = (id) => {
    const result = this.bfs(node => {
      return node.id === id;
    });

    return result;
  };

  addRoot = (id) => {
    this.root = {
      id,
      children: [],
    };
    this.nodeIds.push(id);
  };

  // eslint-disable-next-line
  addNode = (conf) => {
    const { parentId, id, data } = conf;
    if (!this.root) {
      this.addRoot(id, data);
      return;
    }

    let parent;

    if (!parentId) {
      // If parentId was not given, pick a random node as parent
      const index = Math.floor(Math.random() * this.nodeIds.length);
      parent = this.getNode(this.nodeIds[index]);
    } else {
      parent = this.getNode(parentId);
    }

    if (!parent) {
      console.error(`Parent node doesn't exist!`);
      return;
    }

    this.nodeIds.push(id);
    // @ts-ignore
    parent.children.push({
      id,
      // @ts-ignore
      parent,
      children: [],
    });
  };
}
