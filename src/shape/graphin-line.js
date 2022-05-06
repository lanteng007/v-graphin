/* eslint-disable  */
// @ts-nocheck
import G6 from '@antv/g6';
import { deepMix } from '@antv/util';
import { getDefaultStyleByTheme } from '../theme';
import { convertSizeToWH, setStatusStyle } from './utils';

const getStyleByTheme = (theme = {}) => {
  const themeResult = getDefaultStyleByTheme(theme);
  const { defaultEdgeStyle, defaultEdgeStatusStyle } = themeResult;
  return {
    style: defaultEdgeStyle.style,
    status: defaultEdgeStatusStyle.status,
  };
};
function removeDumpAttrs(attrs) {
  Object.keys(attrs).forEach(key => {
    if (attrs[key] === undefined) {
      delete attrs[key];
    }
  });
  return attrs;
}
function parseLabel(json) {
  const { value, ...others } = json;
  const attrs = {
    id: 'label',
    text: value,
    ...others,
  };
  return removeDumpAttrs(attrs);
}

function parseKeyShape(json) {
  const { ...others } = json;
  const attrs = {
    id: 'keyshape',
    ...others,
  };
  return removeDumpAttrs(attrs);
}

function parseHalo(json) {
  const { ...others } = json;
  const attrs = {
    id: 'halo',
    ...others,
  };
  return removeDumpAttrs(attrs);
}

function parseIcon(style) {
  const { icon } = style;

  const {
    value = '',
    type,
    fontFamily,
    // @ts-ignore
    textAlign = 'center',
    // @ts-ignore
    textBaseline = 'middle',
    fill,
    size,
    visible,
    // eslint-disable-next-line no-unused-vars
    clip, // clip字段是保留的，放入attrs中会引起报错
    ...otherAttrs
  } = icon;

  const [width, height] = convertSizeToWH(size);

  const params = {
    name: 'icon',
    visible: visible !== false,
    capture: false,
  };

  if (type === 'text' || type === 'font') {
    return {
      ...params,
      attrs: {
        x: 0,
        y: 0,
        textAlign,
        textBaseline,
        text: value,
        fontSize: width,
        fontFamily,
        fill,
        visible: visible !== false,
        ...otherAttrs,
      },
    };
  }
  // image
  return {
    ...params,
    attrs: {
      x: -width / 2,
      y: -height / 2,
      img: value,
      width,
      height,
      visible: visible !== false,
      ...otherAttrs,
    },
  };
}

const parseAttr = (style, itemShapeName) => {
  if (itemShapeName === 'keyshape') {
    return parseKeyShape(style.keyshape || {});
  }
  if (itemShapeName === 'halo') {
    return parseHalo(style.halo || {});
  }
  if (itemShapeName === 'label') {
    return parseLabel(style.label || {});
  }
  if (itemShapeName === 'icon') {
    return parseIcon(style).attrs;
  }
  return {};
};

// @ts-ignore

const getPolyEdgeControlPoint = (p1, p2, d) => {
  const pm = {
    x: (p2.x + p1.x) / 2,
    y: (p2.y + p1.y) / 2,
  };
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const c = Math.sqrt(dx ** 2 + dy ** 2);
  const y = pm.y - (dx * d) / c || 0;
  const x = pm.x + (dy * d) / c || 0;
  return {
    x,
    y,
  };
};

const processKeyshape = (cfg, style) => {
  const { startPoint = { x: 0, y: 0 }, endPoint = { x: 0, y: 0 }, sourceNode, targetNode } = cfg;

  const { keyshape } = style;

  const { type = 'line', poly = { distance: 0 }, loop = {} } = keyshape;
  const source = sourceNode.get('model');
  const target = targetNode ? targetNode.get('model') : { id: 'temp' };

  if (type === 'loop' || source.id === target.id) {
    const nodeSize = source.style && source.style.keyshape ? source.style.keyshape.size : 26;
    const { distance, dx, rx, ry } = {
      // 默认是是节点的高度
      distance: 0,
      // x的偏移量
      dx: 8,
      rx: undefined,
      ry: undefined,
      ...loop,
    };
    const R = nodeSize / 2;
    const dy = Math.sqrt(R ** 2 - dx ** 2);

    const RX = rx || R * 2 * 0.5;
    const RY = ry || R * 2 * 0.6;
    return [
      ['M', startPoint.x - dx, startPoint.y - dy],
      /**
       * A rx ry x-axis-rotation large-arc-flag sweep-flag x y
       * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths
       */
      [
        'A',
        RX + distance, // rx
        RY + distance, // ry
        0, // x-axis-rotation
        1, // large-arc-flag
        1, // sweep-flag
        startPoint.x + dx, // endPoint.x
        startPoint.y - dy, // endPoint.y
      ],
    ];
  }
  if (type === 'poly') {
    const controlPoints = getPolyEdgeControlPoint(startPoint, endPoint, poly ? poly.distance : 0);
    return [
      ['M', startPoint.x, startPoint.y],
      /**
       * 二阶贝塞尔曲线
       */
      ['Q', controlPoints.x, controlPoints.y, endPoint.x, endPoint.y],
    ];
  }
  // 默认是line
  return [
    ['M', startPoint.x, startPoint.y],
    ['L', endPoint.x, endPoint.y],
  ];
};
// eslint-disable-next-line 
export default () => {
  G6.registerEdge('graphin-line', {
    draw(cfg, group) {
      const { _theme } = cfg.style;

      this.options = getStyleByTheme(_theme);

      const style = deepMix({}, this.options.style, cfg.style);

      /** 将初始化样式存储在model中 */
      if (cfg) {
        // eslint-disable-next-line no-underscore-dangle
        cfg._initialStyle = { ...style };
      }

      const { startPoint = { x: 0, y: 0 }, endPoint = { x: 0, y: 0 }, sourceNode, targetNode } = cfg;

      const { label, halo, keyshape: keyShapeStyle, icon } = style;
      /** 计算目标节点的大小 */
      const source = sourceNode.get('model');
      const target = targetNode ? targetNode.get('model') : { id: 'temp' };
      const nodeSize = source.style && source.style.keyshape ? source.style.keyshape.size : 28;
      /** 计算是否为loop */
      const isLoop = keyShapeStyle ? keyShapeStyle.type === 'loop' : source.id === target.id;
      const hasLabel = label.value;
      /** 计算poly控制点 */
      const isPoly = keyShapeStyle && keyShapeStyle.type === 'poly';
      const controlPoints = getPolyEdgeControlPoint(startPoint, endPoint, keyShapeStyle && keyShapeStyle.poly ? keyShapeStyle.poly.distance : 0);

      const lineWidth = keyShapeStyle ? keyShapeStyle.lineWidth : 1;
      const d = lineWidth + 5;

      const path = processKeyshape(cfg, style);

      const hasIcon = !!icon
      // TODO:支持多边
      // const path = [
      //   ['M', startPoint.x, startPoint.y],
      //   ['L', endPoint.x, endPoint.y],
      // ];

      /** 光环 */
      group.addShape('path', {
        attrs: {
          id: 'halo',
          path,
          lineWidth: lineWidth + 10,
          stroke: halo.stroke || keyShapeStyle.stroke,
          strokeOpacity: halo.strokeOpacity || 0.4,
          ...halo,
        },
        draggable: true,
        name: 'halo',
        visible: halo.visible !== false,
      });

      /** 主路径 */
      const key = (group).addShape('path', {
        attrs: {
          id: 'keyshape',
          path,
          endArrow: isLoop
            ? undefined
            : {
              d: 0,
              path: `M 0,0 L ${d},${d / 2} L ${d},-${d / 2} Z`,
              fill: keyShapeStyle.stroke,
            },
          ...keyShapeStyle,
        },
        draggable: true,
        name: 'keyshape',
      });

      /** 标签 */
      if (hasLabel || hasIcon) {
        /** 计算标签和标签背景的旋转角度 */
        let degree = Math.atan((endPoint.y - startPoint.y) / (endPoint.x - startPoint.x));
        /** 计算标签和标签背景的位移位置 */
        let midPosition = [(startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2];
        if (isPoly) {
          // TODO: 这里label坐标计算有问题，需要调整算法, 今天搞不动了，明天再处理
          midPosition = [(controlPoints.x + midPosition[0]) / 2, (controlPoints.y + midPosition[1]) / 2];
        }

        if (endPoint.x - startPoint.x === 0) {
          degree = Math.PI / 2;
        }
        if (isLoop) {
          degree = 2 * Math.PI;
        }
        if (hasLabel) {
          const { value, fontSize = 8, offset = [0, 0], background, ...others } = label;
          const hasBackground = Boolean(background);
          const [offsetX, offsetY] = offset;
          /** 设置标签的背景 */
          if (hasBackground) {
            const calcWidth = String(value).length * fontSize * 0.6;
            const calcHeight = fontSize * 1.8;
            const defaultBackground = {
              fill: '#fff',
              width: calcWidth,
              height: calcHeight,
              stroke: keyShapeStyle.stroke,
              lineWidth: 1,
              radius: 6,
            };

            const { fill, width, height, stroke, ...otherBackgroundAttrs } = { ...defaultBackground, ...background };
            const labelBackgroundShape = group.addShape('rect', {
              attrs: {
                id: 'label-background',
                x: -width / 2 + offsetX,
                y: -height / 2 + offsetY,
                width,
                height,
                fill,
                stroke,
                ...otherBackgroundAttrs,
              },
              draggable: true,
              name: 'label-background',
            });

            /** 处理标签自动旋转问题 */
            labelBackgroundShape.rotate(degree);
            labelBackgroundShape.translate(midPosition[0], midPosition[1]);
          }

          /** 设置标签的文本 */
          let y = offsetY - fontSize / 2;
          if (isLoop) {
            y = offsetY - nodeSize * 1.6 - (keyShapeStyle && keyShapeStyle.loop ? keyShapeStyle.loop.distance : 0) * 2;
          }
          if (hasBackground) {
            y = offsetY + fontSize / 2;
          }
          const labelShape = group.addShape('text', {
            attrs: {
              id: 'label',
              x: offsetX,
              y,
              text: value,
              fontSize,
              ...others,
            },
            draggable: true,
            name: 'label',
          });
          /** 处理标签自动旋转问题 */
          labelShape.rotate(degree);
          labelShape.translate(midPosition[0], midPosition[1]);
        }
        if (hasIcon) {
          const { type, size, background } = icon
          const hasBackground = Boolean(background);
          /** 设置字体图标的背景 */
          if (hasBackground) {
            const calcWidth = size;
            const calcHeight = size;
            const { padding = 12 } = background
            const defaultBackground = {
              fill: '#fff',
              width: calcWidth + padding,
              height: calcHeight + + padding,
              stroke: keyShapeStyle.stroke,
              lineWidth: 1,
              radius: (size + padding)/2,
            };
            const { fill, width, height, stroke, ...otherBackgroundAttrs } = { ...defaultBackground, ...background };
            const iconBackgroundShape = group.addShape('rect', {
              attrs: {
                id: 'icon-background',
                x: -width / 2,
                y: -height / 2,
                width,
                height,
                fill,
                stroke,
                ...otherBackgroundAttrs,
              },
              draggable: true,
              name: 'icon-background',
            });

            /** 处理标签自动旋转问题 */
            iconBackgroundShape.rotate(degree);
            iconBackgroundShape.translate(midPosition[0], midPosition[1]);
          }
          /** 设置字体图标 */
          let iconShape = null
          if (type === 'font') {
            const iconConfig = parseIcon(style)
            const option = {
              ...iconConfig
            }
            iconShape = group.addShape('text', option);
          }
          if (type === 'image') {
            const imageAttrs = parseIcon(style);
            const option = {
              ...imageAttrs
            }
            iconShape = group.addShape('image', option);
            const { clip } = style.icon;
            if (clip) {
              const { r, ...clipStyle } = clip;
              imageShape.setClip({
                type: 'circle',
                attrs: {
                  x: 0,
                  y: 0,
                  r,
                  ...clipStyle,
                },
              });
            }
          }
          /** 处理标签自动旋转问题 */
          iconShape.rotate(degree);
          iconShape.translate(midPosition[0], midPosition[1]);
        }
      }


      return key;
    },
    setState(
      name,
      value,
      item,
    ) {
      if (!name) return;
      const model = item.getModel();
      const shapes = item.getContainer().get('children'); // 顺序根据 draw 时确定

      const initStateStyle = deepMix({}, this.options.status, model.style.status);

      const initialStyle = item.getModel()._initialStyle;

      const status = item._cfg ? item._cfg.states : [];

      try {
        Object.keys(initStateStyle).forEach(statusKey => {
          if (name === statusKey) {
            if (value) {
              setStatusStyle(shapes, initStateStyle[statusKey], parseAttr); // 匹配到status就改变
            } else {
              setStatusStyle(shapes, initialStyle, parseAttr); // 没匹配到就重置
              status.forEach(key => {
                // 如果cfg.status中还有其他状态，那就重新设置回来
                setStatusStyle(shapes, initStateStyle[key], parseAttr);
              });
            }
          }
        });
      } catch (error) {
        console.error(error);
      }
    },
    afterDraw(cfg, group) {
      const style = deepMix({}, this.options.style, cfg.style);
      const { animate, keyshape } = style;
      /** 如果没有 style.animate 就不绘制 */
      if (!animate || !animate.type || animate.visible === false) {
        return;
      }
      // get the keshape
      const shape = group.get('children').find(s => {
        return s.get('name') === 'keyshape';
      });

      const { color, type, repeat = true, duration = 3000 } = animate;
      if (type === 'circle-running') {
        // the start position of the edge's path
        const startPoint = shape.getPoint(0);

        // add red circle shape
        const circle = group.addShape('circle', {
          attrs: {
            x: startPoint.x,
            y: startPoint.y,
            fill: color || keyshape.stroke,
            r: keyshape.lineWidth * 1.5 + 2,
          },
          name: 'circle-shape',
        });

        // animation for the red circle
        circle.animate(
          ratio => {
            const tmpPoint = shape.getPoint(ratio);
            return {
              x: tmpPoint.x,
              y: tmpPoint.y,
            };
          },
          {
            repeat, // Whether executes the animation repeatly
            duration, // the duration for executing once
          },
        );
      }
      if (type === 'line-dash') {
        let index = 0;
        const lineDash = animate.lineDash || keyshape.lineDash || [4, 2, 1, 2];
        // Define the animation
        shape.animate(
          () => {
            index++;

            if (index > 9) {
              index = 0;
            }
            // returns the modified configurations here, lineDash and lineDashOffset here
            return {
              lineDash,
              lineDashOffset: -index,
            };
          },
          {
            repeat, // whether executes the animation repeatly
            duration, // the duration for executing once
          },
        );
      }
      if (type === 'line-growth') {
        const length = shape.getTotalLength();

        shape.animate(
          ratio => {
            // the operations in each frame. Ratio ranges from 0 to 1 indicating the prograss of the animation. Returns the modified configurations
            const startLen = ratio * length;
            // Calculate the lineDash
            return {
              lineDash: [startLen, length - startLen],
            };
          },
          {
            repeat, // Whether executes the animation repeatly
            duration, // the duration for executing once
          },
        );
      }
    },
  });
};
