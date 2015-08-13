'use strict';

import * as types from '../constants/action-types';
import Immutable from 'immutable';
import * as HelperContainer from '../helpers';

export function AFTER_REDUCE(state, action, helpers) {
  console.log("LOCAL AFTER REDUCE");
  debugger;
  return state.set('visibleData', []);
}
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

  return tempState
  .set('visibleData', helpers.getVisibleData(tempState))
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
    .setIn(['pageProperties', 'pageSize'],
      action.pageSize);

   const stateWithMaxPage = pageSizeState
      .setIn(
        ['pageProperties', 'maxPage'],
        helpers.getPageCount(
          state.get('data').length,
          action.pageSize));

      return helpers.updateVisibleData(stateWithMaxPage);
}
export function GRIDDLE_LOADED_DATA_BEFORE(state, action, helpers) {console.log("HI FROM LOCAL"); return state; }
export function GRIDDLE_LOADED_DATA_AFTER(state, action, helpers) {console.log("BYE FROM LOCAL"); return state; }
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
  if(action.filter === "") {
    const newState = state
      .set('filteredData', Immutable.fromJS([]))
      .setIn(['pageProperties', 'currentPage'], 1)
      .set('filter', '')

      return helpers.updateVisibleData(
        newState
          .setIn(
            ['pageProperties', 'maxPage'],
            helpers.getPageCount(
              //use getDataSet to make sure we're not getting rid of sort/etc
              helpers.getDataSet(newState).length,
              newState.getIn(['pageProperties', 'pageSize']))));
  }

  return helpers.filter(state, action.filter, helpers);
}

//TODO: This is a really simple sort, for now
//      We need to add sort type and different sort operations
export function GRIDDLE_SORT(state, action, helpers) {
  if(!action.sortColumns || action.sortColumns.length < 1) { return state }

  return helpers.sortByColumns(state, action.sortColumns)
}