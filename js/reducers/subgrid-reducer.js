'use strict';

import * as types from '../constants/action-types';
import Immutable from 'immutable';
import MAX_SAFE_INTEGER from 'max-safe-integer';
import FlatMapHelper from '../helpers/flat-map-helper';
import * as DataHelper from '../helpers/data-helpers';
import extend from 'lodash.assign';

/*
OVERALL TODO:
  Update expanded in child rows.
*/
export function AFTER_REDUCE(state, action, helpers) {
  const data = state.get('visibleData');
  const columns = helpers.getDataColumns(state, data);
  const properties = getProperties(columns);
  columns.push(properties.childrenPropertyName);
debugger;
  return state
    .set('visibleData', helpers.getSortedColumns(data, columns))
}

//TODO: Make this more efficient where it'll stop when it finds the record it's looking for
function toggleExpanded(data, griddleKey, childrenPropertyName) {
  return data.map(row => {
    let children = row.get(childrenPropertyName);

    if(children && children.size > 0) {
      children = toggleExpanded(children, griddleKey)
    }

    return row
      .set(childrenPropertyName, children)
      /* Sets the toggle status of the row either to what it is currently or the opposite if this is the one to toggle */
      .set('expanded', row.get('griddleKey') === griddleKey ?
        !row.get('expanded') :
        row.get('expanded'));
  })
}

export function GRIDDLE_ROW_TOGGLED(state, action, helpers) {
  const griddleKey = { action }
  const columns = helpers.getDataColumns(state, state.get('data'));
  const properties = getProperties(columns);

  return state.set('data', toggleExpanded(state.get('data'), action.griddleKey, properties.childrenPropertyName));
}

export function GRIDDLE_LOADED_DATA_AFTER(state, action, helpers) {
  const data = state.get('data');

  const columns = helpers.getDataColumns(state, data);
  const newData = setRowProperties(data, getProperties(columns));

  return state.set('data', newData);
}

function getProperties(columns) {
  return extend({
    childrenPropertyName: 'children',
    columns: []
  }, columns);
}

export function setRowProperties(data, properties, depth = 0, parentId = null) {
  let key = 0;
  const getKey = (() => key+= 1);

  return data.map((row, index) => {
    let children = row.get(properties.childrenPropertyName);
    let currentKey = parentId !== null ? `${parentId}.${getKey()}` : `${row.get('griddleKey')}`;

    if(children && children.size > 0) {
      children = setRowProperties(children, { childrenPropertyName: properties.childrenPropertyName, columns: properties.columns }, depth + 1, currentKey);
    }

    return row
      .sortBy((val, key) => properties.columns.indexOf(key))
      .set('children', children)
      .set('depth', depth)
      .set('griddleKey', currentKey)
      .set('parentId', parentId)
      .set('expanded', false)
      .set('hasChildren', children && children.size > 0);
  });
}