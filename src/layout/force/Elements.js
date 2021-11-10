/* eslint-disable max-classes-per-file */
export class Node {
  id;

  data;

  x;

  y;

  constructor(data) {
    this.id = data.id;
    this.data = data || {};
    this.x = data.x || 0;
    this.y = data.y || 0;
  }
}

export class Edge {
  id;

  source;

  target;

  data;

  constructor(id, source, target, data) {
    this.id = id;
    this.source = source;
    this.target = target;
    this.data = data || {};
  }
}
