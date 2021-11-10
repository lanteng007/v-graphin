import ContextMenu from "./ContextMenu"

ContextMenu.install = function(Vue) {
  Vue.component(ContextMenu.name, ContextMenu);
}

export default ContextMenu