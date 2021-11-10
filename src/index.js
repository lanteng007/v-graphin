// 引入组件
import VGraphin from './index.vue'
import ContextMenu from "./components/ContextMenu/index.js"
import Tooltip from "./components/Tooltip/index.js"
import Toolbar from "./components/Toolbar/index.js"

import registerGraphinForce from './layout/inner/registerGraphinForce';
import registerPresetLayout from './layout/inner/registerPresetLayout';
import { registerGraphinCircle, registerGraphinLine } from './shape';
// install 是默认的方法。当外界在 use 这个组件的时候，就会调用本身的 install 方法，同时传一个 Vue 这个类的参数。
const components = [
  VGraphin,
  ContextMenu,
  Tooltip,
  Toolbar
]
const install = function (Vue) {
  components.forEach(component => {
    Vue.component(component.name, component);
  });
}

/** 注册 Graphin force 布局 */
registerGraphinForce();
/** 注册 Graphin preset 布局 */
registerPresetLayout();

/** 注册 Graphin Circle Node */
registerGraphinCircle();

/** 注册 Graphin line Edge */
registerGraphinLine();

//导出
export default {
  install,
}