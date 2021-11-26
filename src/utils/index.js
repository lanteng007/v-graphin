import hexToRgba, { hexToRgbaToHex } from './hexToRgba';
import mock from './mock';
import shallowEqual from './shallowEqual';
import getNodeStyleByTheme from '../theme/node-style';
import getEdgeStyleByTheme from '../theme/edge-style';
import getComboStyleByTheme from '../theme/combo-style';
import processEdges from './processEdges';
import cloneDeep from 'lodash.clonedeep';

import { deepMix } from '@antv/util';
import uuid from './uuid';
import walk from './walk';
import subLayout from './subLayout';
import { layouts } from '../layout/utils/options';
import { uniqBy } from './array';

export default {
  hexToRgba,
  mock,
  shallowEqual,
  hexToRgbaToHex,
  getNodeStyleByTheme,
  getEdgeStyleByTheme,
  getComboStyleByTheme,
  deepMix,
  cloneDeep,
  uuid,
  walk,
  processEdges,
  subLayout,
  layouts,
  uniqBy,
};
