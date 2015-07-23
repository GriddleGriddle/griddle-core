'use strict';

//clean these up
import * as types from '../constants/action-types';
import Immutable from 'immutable';
import MAX_SAFE_INTEGER from 'max-safe-integer';

export function GRIDDLE_INITIALIZED(state, action) {}

export function GRIDDLE_LOADED_DATA(state, action) {
  return state.set('data', Immutable.fromJS(action.data))
    .set('renderProperties', Immutable.fromJS(action.properties));
}

export function GRIDDLE_TOGGLE_COLUMN(state, action) {
  const toggleColumn = function(columnId, fromProperty, toProperty) {
    if(state.get('renderProperties').get(fromProperty) &&
      state.get('renderProperties').get(fromProperty).has(columnId)) {
        const columnValue = state.getIn(['renderProperties', fromProperty, columnId])

        return state
          .setIn(['renderProperties', toProperty, columnId], columnValue)
          .removeIn(['renderProperties', fromProperty, columnId]);
      }
  }
}