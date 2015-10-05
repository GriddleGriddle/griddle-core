import * as types from '../constants/action-types';

export function resizeColumn(column, change) {
  return {
    type: types.COLUMN_RESIZE,
    gridId,
    column,
    change
  };
}

export function setScrollPosition(xScrollPosition, xScrollMax, yScrollPosition, yScrollMax) {
  return {
    type: types.XY_POSITION_CHANGED,
    xScrollPosition,
    xScrollMax,
    yScrollPosition,
    yScrollMax
  };
}