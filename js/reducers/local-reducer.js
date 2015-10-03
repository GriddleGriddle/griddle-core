'use strict';

import * as types from '../constants/action-types';
import Immutable from 'immutable';

/*
  The handler that happens when data is loaded.
  Needs to set the:
    Properties,
    Data,
    Pagination buttons
    visible data
*/
export function GRIDDLE_LOADED_DATA(state, action, helpers) {
  const columns = action.data.length > 0 ? Object.keys(action.data[0]) : [];

  //set state's data to this
  const tempState = state
  .set('data', helpers.addKeyToRows(Immutable.fromJS(action.data)))
  .set('allColumns', columns)
  .set('renderProperties', Immutable.fromJS(action.properties))
  .setIn(
    ['pageProperties', 'maxPage'],
    helpers.getPageCount(
      action.data.length,
      state.getIn(['pageProperties', 'pageSize'])));

  return tempState;
}

export function AFTER_REDUCE(state, action, helpers) {
   return state
    .set('visibleData', helpers.getVisibleData(state))
    .set('hasNext', helpers.hasNext(state))
    .setIn(
      ['pageProperties', 'maxPage'],
      helpers.getPageCount(
        helpers.getDataSet(state).length,
        state.getIn(['pageProperties', 'pageSize'])))
    .set('hasPrevious', helpers.hasPrevious(state));
}

/*
  Needs to update:
    visible data,
    max pages,
    hasNext,
    hasPrevious
*/
export function GRIDDLE_SET_PAGE_SIZE(state, action, helpers) {
  const pageSizeState = state
    .setIn(['pageProperties', 'pageSize'],
      action.pageSize);

   const stateWithMaxPage = pageSizeState
      .setIn(
        ['pageProperties', 'maxPage'],
        helpers.getPageCount(
          state.get('data').length,
          action.pageSize));

      return stateWithMaxPage;
}

//TODO: Move the helper function to the method body and call this
//      from next / previous. This will be easier since we have
//      the AFTER_REDUCE stuff now.
export function GRIDDLE_GET_PAGE(state, action, helpers) {
  return(helpers
    .getPage(state, action.pageNumber));
}

export function GRIDDLE_NEXT_PAGE(state, action, helpers) {
  return(helpers
    .getPage(state,
    state.getIn(['pageProperties', 'currentPage']) + 1));
}

export function GRIDDLE_PREVIOUS_PAGE(state, action, helpers) {
  return(helpers
      .getPage(state,
      state.getIn(['pageProperties', 'currentPage']) - 1));
}

export function GRIDDLE_FILTERED(state, action, helpers) {
  //TODO: Just set the filter and let the visible data handle what is actually shown + next / previous
  return state.set('filter', action.filter);
}

//TODO: This is a really simple sort, for now
//      We need to add sort type and different sort operations
export function GRIDDLE_SORT(state, action, helpers) {
  if(!action.sortColumns || action.sortColumns.length < 1) { return state }

  return helpers.sortByColumns(state, action.sortColumns)
}