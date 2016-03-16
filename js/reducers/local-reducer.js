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
    it should sort the data if a sort is specified
*/
export function GRIDDLE_LOADED_DATA(state, action, helpers) {
  const columns = action.data.length > 0 ? Object.keys(action.data[0]) : [];
  //set state's data to this
  const tempState = state
  .set('data', helpers.addKeyToRows(Immutable.fromJS(action.data)))
  .set('allColumns', columns)
  .setIn(
    ['pageProperties', 'maxPage'],
    helpers.getPageCount(
      action.data.length,
      state.getIn(['pageProperties', 'pageSize'])))
  .set('loading', false);

  const columnProperties = tempState.get('renderProperties').get('columnProperties');

  return columnProperties ?
     helpers
      .sortDataByColumns(tempState, helpers)
      .setIn(['pageProperties', 'currentPage'], 1) :
    tempState;

}

export function AFTER_REDUCE(state, action, helpers) {
  const tempState = state
    .set('visibleData', helpers.getVisibleData(state))
    .setIn(
      ['pageProperties', 'maxPage'],
      helpers.getPageCount(
        helpers.getDataSetSize(state),
        state.getIn(['pageProperties', 'pageSize'])))

  return tempState
    .set('hasNext', helpers.hasNext(tempState))
    .set('hasPrevious', helpers.hasPrevious(tempState));
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
    .setIn(['pageProperties', 'currentPage'], 1)
    .setIn(['pageProperties', 'pageSize'],
      action.pageSize);

   const stateWithMaxPage = pageSizeState
      .setIn(
        ['pageProperties', 'maxPage'],
        helpers.getPageCount(
          pageSizeState.get('data').size,
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
  const currentPage = state.getIn(['pageProperties', 'currentPage']);
  const maxPage = state.getIn(['pageProperties', 'maxPage']);

  return(helpers
    .getPage(state,
      currentPage < maxPage ? currentPage + 1 : currentPage));
}

export function GRIDDLE_PREVIOUS_PAGE(state, action, helpers) {
  const currentPage = state.getIn(['pageProperties', 'currentPage']);

  return(helpers
      .getPage(state,
        currentPage > 0 ? currentPage - 1 : currentPage ));
}

export function GRIDDLE_FILTERED_BY_COLUMN(state, action, helpers) {
  const filters = state.get('columnFilters');
  const { column, filter } = action;
  let setFilters = filters
    .filter(f => f.column !== column);

  //are we reseting a filter?
  if (filter !== '') {
    setFilters = setFilters.concat({ filter, column });
  }

  return state
    .set('columnFilters', setFilters)
    .setIn(['pageProperties', 'currentPage'], 1);
}

export function GRIDDLE_FILTERED(state, action, helpers) {
  //TODO: Just set the filter and let the visible data handle what is actually shown + next / previous
  return state
    .set('filter', action.filter)
    .setIn(['pageProperties','currentPage'], 1);
}

//TODO: This is a really simple sort, for now
//      We need to add sort type and different sort operations
export function GRIDDLE_SORT(state, action, helpers) {
  if(!action.sortColumns || action.sortColumns.length < 1) { return state }

  // Update the sort columns
  let tempState = helpers.updateSortColumns(state, action.sortColumns);

  const columnProperties = state.get('renderProperties').get('columnProperties');
  // Sort the data
  return helpers
    .sortDataByColumns(tempState, helpers)
    .setIn(['pageProperties', 'currentPage'], 1)
}
