
class Spring {
  /** 源节点ID */
  source;

  /** 目标节点ID */
  target;

  /** 弹簧的长度 */
  length;

  constructor(source, target, length) {
    this.source = source;
    this.target = target;
    this.length = length;
  }
}
export default Spring;
