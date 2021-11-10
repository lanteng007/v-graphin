<template>
  <div id="app">
    <v-graphin :data="data">
      <ContextMenu :options="options" @change="handleChange"> sss </ContextMenu>
    </v-graphin>
    <button @click="handleClick">更新数据</button>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      data: {
        nodes: [
          {
            id: "node-0",
            x: 200,
            y: 240,
            style: {
              // 节点的主要形状，即圆形容器，可以在这里设置节点的大小，border，填充色
              keyshape: {
                /** 容器的宽度 */
                lineWidth: 3,
                /** 节点的大小 */
                size: 80,
                /** 包围边颜色 */
                stroke: "green",
                /** 填充色 */
                fill: "red",
                /** 透明度 */
                opacity: 1,
                /** 鼠标样式 */
                cursor: "pointer",
              },
              // 是节点的标签，可以设置标签的值 和样式：放置方位，大小，字体颜色，偏移位置
              label: {
                /** label的名称 */
                value: "节点-0",
                /** 展示位置  'top' | 'bottom' | 'left' | 'right' | 'center'; */
                position: "top",
                /** 文本填充色 */
                fill: "#000",
                /** 文本大小 */
                fontSize: 16,
                fontFamily: "normal",
                textAlign: "center",
                /** 文本在各自方向上的偏移量，主要为了便于调整文本位置 */
                offset: 0,
              },
              // 是节点的中心 ICON 区域，icon 可以是图片，可以是文本，也可以是字体图标。
              icon: {
                /** 类型可以为字体图标，可以为网络图片，可以为纯文本 'font' | 'image' | 'text' */
                type: "font",
                /** 根据类型，填写对应的值 */
                value: "",
                /** 图标大小 */
                size: 40,
                /** 字体图标的填充色 */
                fill: "",
                /** 字体Family */
                fontFamily: "graphin",
              },
              // 节点的徽标区域，是一个数组，可以分别在不同方位放置，其内容区域可以是文本，数字，也可以是图标。
              badges: [
                {
                  /** 放置的位置，ef：LT（left top）左上角 */
                  position: "RT",
                  /** 类型可以为字体图标，可以为网络图片，可以为纯文本 */
                  type: "text",
                  value: "10",
                  // type = image 时生效，表示图片的宽度和高度
                  size: [25, 25],
                  /** 徽标填充色 */
                  fill: "blue",
                  /** 徽标描边色 */
                  stroke: "black",
                  /** 徽标内文本的颜色 */
                  color: "#fff",
                  fontSize: 14,
                  fontFamily: "",
                  // badge 中文本距离四周的偏移量
                  padding: 0,
                  // badge 在 x 和 y 方向上的偏移量
                  offset: [0, 0],
                },
                {
                  /** 放置的位置，ef：LT（left top）左上角 */
                  position: "LB",
                  /** 类型可以为字体图标，可以为网络图片，可以为纯文本 */
                  type: "text",
                  value: "Pin",
                  // type = image 时生效，表示图片的宽度和高度
                  size: [25, 25],
                  /** 徽标填充色 */
                  fill: "",
                  /** 徽标描边色 */
                  stroke: "",
                  /** 徽标内文本的颜色 */
                  color: "#fff",
                  fontSize: 12,
                  fontFamily: "",
                  // badge 中文本距离四周的偏移量
                  padding: 0,
                  // badge 在 x 和 y 方向上的偏移量
                  offset: [0, 0],
                },
              ],
              // 节点的光环，在节点交互过程中（hover，selected，disabled，active）等，可以打开光环，默认是隐藏的，也可以自定义
              halo: {
                /** 光晕 */
                fill: "red",
                /** 透明度 */
                opacity: 1,
                /** 是否展示 */
                visible: true,
                /** 鼠标Hover上去样式 */
                cursor: "pointer",
              },
              // 节点的交互样式，默认 Graphin 已经内置了交互样式（即将 halo 图形显示出来），也可以自定义
              status: {
                hover: {
                  halo: {
                    visible: true,
                  },
                },
                selected: {
                  halo: {
                    visible: true,
                  },
                  keyshape: {
                    lineWidth: 10,
                  },
                },
              },
            },
          },
          {
            id: "node-1",
            x: 400,
            y: 640,
            style: {
              // 节点的主要形状，即圆形容器，可以在这里设置节点的大小，border，填充色
              keyshape: {
                /** 容器的宽度 */
                lineWidth: 3,
                /** 节点的大小 */
                size: 80,
                /** 包围边颜色 */
                stroke: "green",
                /** 填充色 */
                fill: "red",
                /** 透明度 */
                opacity: 1,
                /** 鼠标样式 */
                cursor: "pointer",
              },
              // 是节点的标签，可以设置标签的值 和样式：放置方位，大小，字体颜色，偏移位置
              label: {
                /** label的名称 */
                value: "节点-0",
                /** 展示位置  'top' | 'bottom' | 'left' | 'right' | 'center'; */
                position: "top",
                /** 文本填充色 */
                fill: "#000",
                /** 文本大小 */
                fontSize: 16,
                fontFamily: "normal",
                textAlign: "center",
                /** 文本在各自方向上的偏移量，主要为了便于调整文本位置 */
                offset: 0,
              },
              // 是节点的中心 ICON 区域，icon 可以是图片，可以是文本，也可以是字体图标。
              icon: {
                /** 类型可以为字体图标，可以为网络图片，可以为纯文本 'font' | 'image' | 'text' */
                type: "font",
                /** 根据类型，填写对应的值 */
                value: "",
                /** 图标大小 */
                size: 40,
                /** 字体图标的填充色 */
                fill: "",
                /** 字体Family */
                fontFamily: "graphin",
              },
              // 节点的徽标区域，是一个数组，可以分别在不同方位放置，其内容区域可以是文本，数字，也可以是图标。
              badges: [
                {
                  /** 放置的位置，ef：LT（left top）左上角 */
                  position: "RT",
                  /** 类型可以为字体图标，可以为网络图片，可以为纯文本 */
                  type: "text",
                  value: "10",
                  // type = image 时生效，表示图片的宽度和高度
                  size: [25, 25],
                  /** 徽标填充色 */
                  fill: "blue",
                  /** 徽标描边色 */
                  stroke: "black",
                  /** 徽标内文本的颜色 */
                  color: "#fff",
                  fontSize: 14,
                  fontFamily: "",
                  // badge 中文本距离四周的偏移量
                  padding: 0,
                  // badge 在 x 和 y 方向上的偏移量
                  offset: [0, 0],
                },
                {
                  /** 放置的位置，ef：LT（left top）左上角 */
                  position: "LB",
                  /** 类型可以为字体图标，可以为网络图片，可以为纯文本 */
                  type: "text",
                  value: "Pin",
                  // type = image 时生效，表示图片的宽度和高度
                  size: [25, 25],
                  /** 徽标填充色 */
                  fill: "",
                  /** 徽标描边色 */
                  stroke: "",
                  /** 徽标内文本的颜色 */
                  color: "#fff",
                  fontSize: 12,
                  fontFamily: "",
                  // badge 中文本距离四周的偏移量
                  padding: 0,
                  // badge 在 x 和 y 方向上的偏移量
                  offset: [0, 0],
                },
              ],
              // 节点的光环，在节点交互过程中（hover，selected，disabled，active）等，可以打开光环，默认是隐藏的，也可以自定义
              halo: {
                /** 光晕 */
                fill: "red",
                /** 透明度 */
                opacity: 1,
                /** 是否展示 */
                visible: true,
                /** 鼠标Hover上去样式 */
                cursor: "pointer",
              },
              // 节点的交互样式，默认 Graphin 已经内置了交互样式（即将 halo 图形显示出来），也可以自定义
              status: {
                hover: {
                  halo: {
                    visible: true,
                  },
                },
                selected: {
                  halo: {
                    visible: true,
                  },
                  keyshape: {
                    lineWidth: 10,
                  },
                },
              },
            },
          },
        ],
        edges: [
          {
            source: "node-0",
            target: "node-1",
            style: {
              label: {
                value: "设置 label 的 background ",
                fill: "#fff",
                fontSize: 12,
                background: {
                  // 设置背景的填充色
                  fill: "lightgreen",
                  // 设置圆角
                  radius: 8,
                  // 设置border，即 stroke
                  stroke: "#000",
                },
              },
            },
          },
        ],
      },
      options: [
        {
          key: "tag",
          icon: '',
          name: "打标",
        },
        {
          key: "delete",
          icon: '',
          name: "删除",
        },
        {
          key: "expand",
          icon: '',
          name: "扩散",
        },
      ],
    };
  },
  methods: {
    handleClick() {
      this.data = {
        // 点集
        nodes: [
          {
            id: "node5", // String，该节点存在则必须，节点的唯一标识
            x: 100, // Number，可选，节点位置的 x 值
            y: 200, // Number，可选，节点位置的 y 值
          },
          {
            id: "node6", // String，该节点存在则必须，节点的唯一标识
            x: 300, // Number，可选，节点位置的 x 值
            y: 200, // Number，可选，节点位置的 y 值
          },
          {
            id: "node3", // String，该节点存在则必须，节点的唯一标识
            x: 600, // Number，可选，节点位置的 x 值
            y: 200, // Number，可选，节点位置的 y 值
          },
          {
            id: "node4", // String，该节点存在则必须，节点的唯一标识
            x: 800, // Number，可选，节点位置的 x 值
            y: 200, // Number，可选，节点位置的 y 值
          },
        ],
        // 边集
        edges: [
          {
            source: "node3", // String，必须，起始点 id
            target: "node4", // String，必须，目标点 id
          },
        ],
      };
    },
    handleChange(item,data) {
      console.log(item)
      console.log(data)
    }
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
