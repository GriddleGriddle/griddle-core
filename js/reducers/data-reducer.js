'use strict';

//clean these up
import * as types from '../constants/action-types';
import Immutable from 'immutable';
import MAX_SAFE_INTEGER from 'max-safe-integer';

export function GRIDDLE_LOADED_DATA_BEFORE(state, action, helpers) {console.log("HI FROM DATA"); return state; }
export function GRIDDLE_LOADED_DATA_AFTER(state, action, helpers) {console.log("BYE FROM DATA"); return state; }

export function GRIDDLE_INITIALIZED(state, action, helpers) {}

export function GRIDDLE_LOADED_DATA(state, action, helpers) {
  return state.set('data', helpers.addKeyToRows(Immutable.fromJS(action.data)))
    .set('renderProperties', Immutable.fromJS(action.properties));
}

export function GRIDDLE_TOGGLE_COLUMN(state, action, helpers) {
  const toggleColumn = function(columnId, fromProperty, toProperty) {
    if(state.get('renderProperties').get(fromProperty) &&
      state.get('renderProperties').get(fromProperty).has(columnId)) {
        const columnValue = state.getIn(['renderProperties', fromProperty, columnId])
        return state
          .setIn(['renderProperties', toProperty, columnId], columnValue)
          .removeIn(['renderProperties', fromProperty, columnId]);
      }
  }

  //check to see if the column is in hiddenColumnProperties
  //if it is move it to columnProperties
  const hidden = toggleColumn(action.columnId, 'hiddenColumnProperties', 'columnProperties');

  //if it is not check to make sure it's in columnProperties and move to hiddenColumnProperties
  const column = toggleColumn(action.columnId, 'columnProperties', 'hiddenColumnProperties');

  //if it's neither just return state for now
  return helpers.updateVisibleData(hidden || column || state);
}