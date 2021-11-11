import G6 from "@antv/g6";


function registerNode(nodeName, options, extendedNodeName) {
  G6.registerNode(nodeName, options, extendedNodeName);
}
function registerEdge(edgeName, options, extendedEdgeName) {
  G6.registerEdge(edgeName, options, extendedEdgeName);
}
function registerCombo(comboName, options, extendedComboName) {
  G6.registerCombo(comboName, options, extendedComboName);
}
function registerBehavior(behaviorName, behavior) {
  G6.registerBehavior(behaviorName, behavior);
}
function registerFontFamily(iconLoader) {
  /**  注册 font icon */
  const iconFont = iconLoader();
  const { glyphs, fontFamily } = iconFont;
  const icons = glyphs.map((item) => {
    return {
      name: item.name,
      unicode: String.fromCodePoint(item.unicode_decimal),
    };
  });
  return new Proxy(icons, {
    get: (target, propKey) => {
      const matchIcon = target.find((icon) => {
        return icon.name === propKey;
      });
      if (!matchIcon) {
        console.error(
          `%c fontFamily:${fontFamily},does not found ${propKey} icon`
        );
        return "";
      }
      return matchIcon.unicode;
    },
  });
}

export {
  registerNode,
  registerEdge,
  registerCombo,
  registerBehavior,
  registerFontFamily
};