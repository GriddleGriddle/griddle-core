'use strict';

import * as types from '../constants/action-types';
import Immutable from 'immutable';
import MAX_SAFE_INTEGER from 'max-safe-integer';
import FlatMapHelper from '../helpers/flat-map-helper';

export function AFTER_REDUCE(state, action, helpers) {
  const data = state.get('visibleData');
  const factory = ((settings) => { return {...settings, depth : settings.depth +1 }} );

  const flattenedData = data.flatMap(FlatMapHelper, {settings: {parentId: null, depth: 0, expanded: false}, factory });

  return state
    .set('visibleData', flattenedData)
}

export function GRIDDLE_LOADED_DATA_AFTER(state, action, helpers) {
  const data = state.get('data');
  const newData = setRowProperties(data);

  return state.set('data', data);
}

export function setRowProperties(data, childrenPropertyName = 'children') {
  return data.map(row => {
    let children = row.get('children');

    if(children && children.size > 0) {
      children = setRowProperties(children, childrenPropertyName);
    }

    return row
      .set('children', children)
      .set('expanded', false)
      .set('hasChildren', children && children.size > 0);
  });
}