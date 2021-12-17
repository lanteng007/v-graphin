import { isArray, isNumber } from '@antv/util';
/**
 *
 * @param shapes 元素组合的shape集合
 * @param statusStyle 该节点的样式：可以是状态激活样式，也可以是默认样式
 * @param parseAttr 将用户传递的JSON解析为G理解的Attr
 */
// eslint-disable-next-line 
export const setStatusStyle = (shapes, statusStyle, parseAttr) => {
  // eslint-disable-next-line 
  if (!statusStyle) {
    return;
  }
  try {
    // eslint-disable-next-line 
    shapes.forEach((shapeItem) => {
      const itemShapeName = shapeItem.cfg.name;
      const style = statusStyle[itemShapeName];
      if (style) {
        const { animate, visible, ...otherAttrs } = parseAttr(statusStyle, itemShapeName);

        // eslint-disable-next-line no-empty
        if (!shapeItem.attrs.img) {
          // 保留原有坐标，默认重置为0，0
          const { x, y } = shapeItem.attrs;
          shapeItem.attr({ ...otherAttrs, x, y });
          shapeItem.cfg.visible = visible !== false;
          if (animate) {
            const { attrs, ...animateOptions } = animate;
            shapeItem.animate(attrs, animateOptions);
          }
        } else {
          // 保留原有坐标,及宽高
          const { x, y, width, height } = shapeItem.attrs;
          shapeItem.attr({ ...otherAttrs, x, y, width, height });
        }
      }
    });
  } catch (error) {
    console.error(error);
  }
};

// eslint-disable-next-line 

export function removeDumpAttrs(attrs) {
  Object.keys(attrs).forEach(key => {
    // @ts-ignore
    if (attrs[key] === undefined) {
      // @ts-ignore
      delete attrs[key];
    }
  });
  return attrs;
}

/**
 * 将 size 转换为宽度和高度
 * @param size
 */
export const convertSizeToWH = (size) => {
  if (!size) return [0, 0];
  let width = 0;
  let height = 0;
  if (isNumber(size)) {
    width = size;
    height = size;
  } else if (isArray(size)) {
    if (size.length === 1) {
      const [w] = size;
      width = w;
      height = w;
    } else if (size.length === 2) {
      const [w, h] = size;
      width = w;
      height = h;
    }
  }
  return [width, height];
};

export const getLabelXYByPosition = (
  cfg,
) => {
  const { label, keyshape } = cfg;
  if (!keyshape && keyshape.size && !label && label.offset) {
    return {
      // @ts-ignore
      x: undefined,
      // @ts-ignore
      y: undefined,
      // @ts-ignore
      textBaseline: label ? label.textBaseline : undefined,
    };
  }
  if (!keyshape && keyshape.size && label && label.offset) {
    keyshape.size = 26; // 临时方案
    console.info('you should set keyshape.size when you update label position,the default keyshape size value is  26');
  }

  const { size } = keyshape;

  let offsetArray = [0, 0];
  const { position: labelPosition, offset = offsetArray } = label;
  if (typeof offset === 'number' || typeof offset === 'string') {
    offsetArray = [Number(offset), Number(offset)];
  }
  if (offset.length > 0) {
    offsetArray = offset;
  }

  const [offsetX, offsetY] = offsetArray;
  // 默认的位置（最可能的情形），所以放在最上面
  if (labelPosition === 'center') {
    return {
      x: 0 + offsetX,
      y: 0 + offsetY,
    };
  }
  const wh = convertSizeToWH(size);

  const width = wh[0];
  const height = wh[1];

  // eslint-disable-next-line 
  let positionAttrs;
  switch (labelPosition) {
    case 'top':
      positionAttrs = {
        x: 0 + offsetX,
        y: -height / 2 - offsetY,
        textBaseline: 'bottom', // 文本在图形的上面
      };
      break;
    case 'bottom':
      positionAttrs = {
        x: 0 + offsetX,
        y: height / 2 + offsetY,
        textBaseline: 'top',
      };
      break;
    case 'left':
      positionAttrs = {
        x: 0 - width - offsetX,
        y: 0 + offsetY,
        textAlign: 'right',
      };
      break;
    case 'right':
      positionAttrs = {
        x: 0 + width + offsetX,
        y: 0 + offsetY,
        textAlign: 'left',
      };
      break;
    default:
      positionAttrs = {
        x: 0 + offsetX,
        y: height / 2 + offsetY,
        textBaseline: 'top',
      };
      break;
  }
  return positionAttrs;
};

export const getBadgePosition = (position = 'RT', r) => {
  let badgeX = 0;
  let badgeY = 0;
  if (position === 'LT') {
    badgeX = r * Math.cos((Math.PI * 3) / 4);
    badgeY = -r * Math.sin((Math.PI * 3) / 4);
  } else if (position === 'LB') {
    // left bottom
    badgeX = r * Math.cos((Math.PI * 5) / 4);
    badgeY = -r * Math.sin((Math.PI * 5) / 4);
  } else if (position === 'RT') {
    // right top
    badgeX = r * Math.cos((Math.PI * 1) / 4);
    badgeY = -r * Math.sin((Math.PI * 1) / 4);
  } else if (position === 'RB') {
    // right bottom
    badgeX = r * Math.cos((Math.PI * 7) / 4);
    badgeY = -r * Math.sin((Math.PI * 7) / 4);
  }
  return {
    x: badgeX,
    y: badgeY,
  };
};

export const getPolygonPointsByNumAndSize = (num, size) => {
  if (!num || !size) return [];
  let points = [];
  if (num === 3) {
    // A (0,-✓3/3*a) B (-a/2,✓3/6*a) C (a/2,✓3/6*a) a为边长
    const a = size;
    const pointAY = Number(-(Math.sqrt(3) / 3 * a))
    const pointA = [0, pointAY]
    const pointBY = Number((Math.sqrt(3) / 6 * a))
    const pointB = [-a / 2, pointBY]
    const pointC = [a / 2, pointBY]
    points = [pointA, pointB, pointC]
  } else if (num === 4) {
    // A (0,-✓2/2*a) B (-✓2/2*a,0) C (0,✓2/2*a) D (✓2/2*a,0) a为边长
    const a = size;
    const p = Number((Math.sqrt(2) / 2 * a))
    const pointA = [0, -p];
    const pointB = [-p, 0];
    const pointC = [0, p];
    const pointD = [p, 0];
    points = [pointA, pointB, pointC, pointD]
  } else if (num === 5) {
    // A (a*Math.cos(1/10 * Math.PI),a*Math.sin(1/10 * Math.PI)) B (0,a) C (-a*Math.cos(1/10 * Math.PI),a*Math.sin(1/10 * Math.PI)) 
    // D (-a*Math.sin(1/5 * Math.PI),-a*Math.cos(1/5 * Math.PI)) E (a*Math.sin(1/5 * Math.PI),-a*Math.cos(1/5 * Math.PI)) a 为原点到各点的长度，size/2
    const a = size / 2;
    const pointA = [a * Math.cos(1 / 10 * Math.PI), -a * Math.sin(1 / 10 * Math.PI)];
    const pointB = [0, -a];
    const pointC = [-a * Math.cos(1 / 10 * Math.PI), -a * Math.sin(1 / 10 * Math.PI)];
    const pointD = [-a * Math.sin(1 / 5 * Math.PI), a * Math.cos(1 / 5 * Math.PI)];
    const pointE = [a * Math.sin(1 / 5 * Math.PI), a * Math.cos(1 / 5 * Math.PI)];
    points = [pointA, pointB, pointC, pointD, pointE]
  } else if (num === 6) {
    // A (0,-a) B (-✓3/2*a,-a/2) C (-✓3/2*a, a/2) D (0,a) E (✓3/2*a, a/2) F (✓3/2*a, -a/2) a 为原点到各点的长度，size/2
    const a = size / 2;
    const p = Number((Math.sqrt(3) / 2 * a))
    const pointA = [0, -a];
    const pointB = [-p, -a / 2];
    const pointC = [-p, a / 2];
    const pointD = [0, a];
    const pointE = [p, a / 2];
    const pointF = [p, -a / 2];
    points = [pointA, pointB, pointC, pointD, pointE, pointF]
  }
  return points
}
