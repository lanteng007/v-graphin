/* eslint-disable  */
import G6 from '@antv/g6';
import { deepMix, isArray, isNumber } from '@antv/util';
import { getDefaultStyleByTheme } from '../theme';
import { convertSizeToWH, getBadgePosition, getLabelXYByPosition, removeDumpAttrs, setStatusStyle, getPolygonPointsByNumAndSize } from './utils';
const polygonTypes = ['triangle','rhombus','pentagon','hexagon']
function getRadiusBySize(size) {
  let r;
  if (isNumber(size)) {
    r = size / 2;
  } else if (isArray(size)) {
    r = size[0] / 2;
  }
  return r;
}
const getKeyshapeAttrs = (keyshape) => {
  const { type = 'circle', size, visible, stroke, fill, fillOpacity, strokeOpacity, ...otherAttrs } = keyshape;

  let attrs = {
    cursor: 'pointer',
    visible: visible !== false,
    stroke,
    strokeOpacity: strokeOpacity || 1,
    fill: fill || stroke,
    fillOpacity: fillOpacity || 0.2,
    ...otherAttrs,
  };
  if (type === 'circle') {
    const r = getRadiusBySize(size);
    attrs = {
      ...attrs,
      x: 0,
      y: 0,
      r
    };
  } else if (type === 'rect') {
    const [width, height] = convertSizeToWH(size)
    attrs = {
      ...attrs,
      x: - width / 2,
      y: - height / 2,
      width,
      height,
    };
  } else if(type === 'triangle') {
    const points = getPolygonPointsByNumAndSize(3,size)
    attrs = {
      ...attrs,
      points
    };
  } else if (type === 'rhombus') {
    const points = getPolygonPointsByNumAndSize(4,size)
    attrs = {
      ...attrs,
      points
    };
  } else if (type === 'pentagon') {
    const points = getPolygonPointsByNumAndSize(5,size)
    attrs = {
      ...attrs,
      points
    };
  } else if(type === 'hexagon') {
    const points = getPolygonPointsByNumAndSize(6,size)
    attrs = {
      ...attrs,
      points
    };
  }
  return attrs
}
const getIconAttrs = (icon) => {
  const {
    value = '',
    type,
    fontFamily,
    textAlign = 'center',
    textBaseline = 'middle',
    fill,
    size,
    visible,
    // eslint-disable-next-line no-unused-vars
    clip, // clip字段是保留的，放入attrs中会引起报错
    ...otherAttrs
  } = icon;
  let attrs = {}
  const [width, height] = convertSizeToWH(size);
  if (type === 'text' || type === 'font') {
    attrs = {
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
    }
  } else {
    attrs = {
      x: - width / 2,
      y: - height / 2,
      img: value,
      width,
      height,
      visible: visible !== false,
      ...otherAttrs,
    }
  }
  return attrs
}
const getHaloAttrs = (style) => {
  const { halo, keyshape } = style;

  const { size, visible, fill, fillOpacity, ...otherAttrs } = halo;
  const { type = 'circle' } = keyshape

  let keyshapeFill;
  let keyshapeStroke;

  if (keyshape && keyshape.fill) {
    keyshapeFill = keyshape.fill;
  }
  if (keyshape && keyshape.stroke) {
    keyshapeStroke = keyshape.stroke;
  }

  let attrs = {
    fillOpacity: fillOpacity || 0.1,
    fill: fill || keyshapeFill || keyshapeStroke,
    visible: visible !== false,
    ...otherAttrs,
  };
  if(type === 'circle') {
    const haloR = getRadiusBySize(size);

    let keyshapeR;

    if (keyshape && keyshape.size) {
      const calculateR = getRadiusBySize(keyshape.size);
      keyshapeR = calculateR + 15;
    }
    
    attrs = {
      ...attrs,
      x: 0,
      y: 0,
      r: haloR || keyshapeR, // 默认 halo的样式和keyshape相关 
    r: haloR || keyshapeR, // 默认 halo的样式和keyshape相关
      r: haloR || keyshapeR, // 默认 halo的样式和keyshape相关 
    r: haloR || keyshapeR, // 默认 halo的样式和keyshape相关
      r: haloR || keyshapeR, // 默认 halo的样式和keyshape相关 
    }
  } else if(type === 'rect') {
    const [width, height] = convertSizeToWH(keyshape.size)
    const keyshapeWidth = width + 20;
    const keyshapeHeight = height + 20;
    attrs = {
      ...attrs,
      x: - keyshapeWidth / 2,
      y: - keyshapeHeight / 2,
      width: keyshapeWidth,
      height: keyshapeHeight
    }
  } else if(type === 'triangle') {
    const a = size || keyshape.size  + 30
    const points = getPolygonPointsByNumAndSize(3,a)
    attrs = {
      ...attrs,
      points
    };
  } else if(type === 'rhombus') {
    const a = size || keyshape.size  + 30
    const points = getPolygonPointsByNumAndSize(4,a)
    attrs = {
      ...attrs,
      points
    };
  } else if(type === 'pentagon') {
    const a = size || keyshape.size  + 30
    const points = getPolygonPointsByNumAndSize(5,a)
    attrs = {
      ...attrs,
      points
    };
  } else if(type === 'hexagon') {
    const a = size || keyshape.size  + 30
    const points = getPolygonPointsByNumAndSize(6,a)
    attrs = {
      ...attrs,
      points
    };
  }
  return attrs;
}

const getStyleByTheme = (theme = {}) => {
  const themeResult = getDefaultStyleByTheme(theme);
  const { defaultNodeStyle, defaultNodeStatusStyle } = themeResult;
  return {
    style: defaultNodeStyle.style,
    status: defaultNodeStatusStyle.status,
  };
};

/**
 * @description 解析Halo
 * @param config 用户输入的数据
 */
const parseHalo = (style) => {
  const { halo } = style;

  const { visible } = halo;

  const attrs = getHaloAttrs(style);

  return {
    name: 'halo',
    visible: visible !== false,
    attrs: removeDumpAttrs(attrs),
  };
};

const parseKeyshape = (style) => {
  const { keyshape } = style;
  const { visible } = keyshape;

  // const r = getRadiusBySize(size);
  const attrs = getKeyshapeAttrs(keyshape);
  return {
    name: 'keyshape',
    visible: visible !== false,
    attrs: removeDumpAttrs(attrs),
  };
};

// export type TextAlignType = 'center';
const parseLabel = (style) => {
  const { label } = style;

  const { value, fill, fontSize, visible, ...otherAttrs } = label;
  // @ts-ignore
  const labelPos = getLabelXYByPosition(style);

  const attrs = {
    x: labelPos.x,
    y: labelPos.y,
    fontSize,
    text: value,
    textAlign: 'center',
    fill,
    textBaseline: labelPos.textBaseline,
    visible: visible !== false,
    ...otherAttrs,
  };
  return {
    name: 'label',
    visible: visible !== false,
    attrs: removeDumpAttrs(attrs),
  };
};

const parseIcon = (style) => {
  const { icon } = style;

  const { visible } = icon;

  const params = {
    name: 'icon',
    visible: visible !== false,
    capture: false,
  };
  const attrs = getIconAttrs(icon)
  return {
    ...params,
    attrs,
  };
};

/** 根据用户输入的json，解析成attr */
// eslint-disable-next-line 
const parseAttr = (style, itemShapeName) => {
  if (itemShapeName === 'keyshape') {
    return parseKeyshape(style).attrs;
  }
  if (itemShapeName === 'halo') {
    return parseHalo(style).attrs;
  }
  if (itemShapeName === 'label') {
    return parseLabel(style).attrs;
  }
  if (itemShapeName === 'icon') {
    return parseIcon(style).attrs;
  }

  return style[itemShapeName] || {};
};
const drawIcon = (group, icon, style) => {
  const { type } = icon;
  if (type === 'text' || type === 'font') {
    group.addShape('text', parseIcon(style));
  }
  if (type === 'image') {
    const imageAttrs = parseIcon(style);
    const imageShape = group.addShape('image', imageAttrs);
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
}

const drawBadge = (badge, group, r) => {
  const {
    type,
    position,
    value: badgeValue = '',
    size: badgeSize,
    fill,
    stroke,
    color,
    fontSize,
    fontFamily,
    padding = 0,
    offset: inputOffset = [0, 0],
    id
  } = badge;

  const offset = convertSizeToWH(inputOffset);
  const [width, height] = convertSizeToWH(badgeSize);
  const { x: badgeX, y: badgeY } = getBadgePosition(position, r);

  let realX = badgeX;
  let realY = badgeY;

  // 绘制 badge 的外层容器，根据宽度和高度确定是 circle 还是 rect

  if (width === height) {
    realX += offset[0];
    realY += offset[1];
    const shape = {
      attrs: {
        r: width / 2 + padding,
        fill,
        stroke,
        x: realX,
        y: realY,
      },
      name: 'badges-circle',
    }
    if (id) {
      shape.id = id;
    }
    group.addShape('circle', shape);
  } else {
    realX = badgeX - width - padding * 2;
    realY = badgeY - height - padding * 2;

    if (position === 'LB') {
      realY = badgeY;
    } else if (position === 'RT') {
      realX = badgeX;
      realY = badgeY - height - padding * 2;
    } else if (position === 'RB') {
      realX = badgeX;
      realY = badgeY;
    }

    realX += offset[0];
    realY += offset[1];
    const shape = {
      attrs: {
        width: width + padding * 2,
        height: height + padding * 2,
        fill,
        stroke,
        x: realX,
        y: realY,
        radius: (height + padding * 2) / 3,
      },
      name: 'badges-rect',
    }
    if (id) {
      shape.id = id;
    }
    group.addShape('rect', shape);
  }

  if (type === 'font' || type === 'text') {
    group.addShape('text', {
      attrs: {
        x: width !== height ? realX + width / 2 + padding : realX,
        y: width !== height ? realY + height / 2 + padding : realY,
        text: badgeValue,
        fontSize,
        textAlign: 'center',
        textBaseline: 'middle',
        fontFamily,
        fill: color,
      },
      capture: false,
      name: 'badges-text',
    });
  } else if (type === 'image') {
    group.addShape('image', {
      attrs: {
        x: realX - width / 2,
        y: realX - height / 2,
        width,
        height,
        img: badgeValue,
      },
      capture: false,
      name: 'badges-image',
    });
  }
};
export default () => {
  G6.registerNode('graphin-circle', {
    options: {
      style: {},
      status: {},
    },
    draw(cfg, group) {
      // @ts-ignore
      const { _theme } = cfg.style;

      this.options = getStyleByTheme(_theme);

      const style = deepMix({}, this.options.style, cfg.style); // getStyles({}, this.options.style, cfg.style) as NodeStyle;
      /** 将初始化样式存储在model中 */
      cfg._initialStyle = { ...style };
      const { icon, badges = [], keyshape: keyShapeStyle } = style;

      const r = getRadiusBySize(keyShapeStyle.size);

      // keyshape 主容器
      // 默认是圆
      let { type = 'circle' } = keyShapeStyle
      type = polygonTypes.includes(type) ? 'polygon' : type

      const keyShape = group.addShape(type, parseKeyshape(style, type));

      // halo 光晕
      group.addShape(type, parseHalo(style));

      // 文本

      group.addShape('text', parseLabel(style));

      // keyShape 中间的 icon

      drawIcon(group, icon, style)

      // badges 会存在多个的情况
      badges.forEach(badge => {
        drawBadge(badge, group, r);
      });

      return keyShape;
    },
    setState(name, value, item) {
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
    //暂时不考虑性能
    // update(cfg, item) {
    //   if (!cfg.style) return;
    //   try {
    //     const style = deepMix({}, cfg._initialStyle, cfg.style); // getStyles(cfg._initialStyle, cfg.style) as NodeStyle;
    //     cfg._initialStyle = { ...style };
    //     const { badges, keyshape } = style;
    //     const r = getRadiusBySize(keyshape.size);
    //     const group = item.getContainer();
    //     const shapes = group.get('children');
    //     setStatusStyle(shapes, style, parseAttr);

    //     const copyShapes = [...shapes];
    //     if (badges && badges.length > 0) {
    //       let index = 0;
    //       copyShapes.forEach(shape => {
    //         if (shape.cfg.name.startsWith('badges')) {
    //           shapes.splice(index, 1);
    //         } else {
    //           index = index + 1;
    //         }
    //       });
    //       badges.forEach(badge => {
    //         drawBadge(badge, group, r);
    //       });
    //     }
    //   } catch (error) {
    //     console.error('error');
    //   }
    // },
    // eslint-disable-next-line 
  });
};
