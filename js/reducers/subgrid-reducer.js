'use strict';

import * as types from '../constants/action-types';
import Immutable from 'immutable';
import MAX_SAFE_INTEGER from 'max-safe-integer';
import FlatMapHelper from '../helpers/flat-map-helper';

export function AFTER_REDUCE(state, action, helpers) {
  return state; 
}

export function GRIDDLE_LOADED_DATA_AFTER(state, action, helpers) {
 //add expanded and parent id information
  const factory = ((settings) => { return {...settings, depth : settings.depth +1 }} );

  //data should already be loaded at this point
  const data = state.get('visibleData');
  const flattenedData = data.flatMap(FlatMapHelper, {settings: {parentId: null, depth: 0}, factory }); 

  return state
    .set('visibleData', flattenedData)

}