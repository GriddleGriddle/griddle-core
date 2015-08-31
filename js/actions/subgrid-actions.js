import * as types from '../constants/action-types';

export function expandRow(griddleKey){
  return {
    type: types.GRIDDLE_ROW_TOGGLED,
    griddleKey: griddleKey
  };
}