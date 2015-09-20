import * as types from '../constants/action-types';

export function toggleRowSelection(griddleKey) {
  return {
    type: types.GRIDDLE_ROW_SELECTION_TOGGLED,
    griddleKey
  };

}