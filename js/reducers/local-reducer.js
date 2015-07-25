'use strict';

import * as types from '../constants/action-types';
import Immutable from 'immutable';
import * as HelperContainer from '../helpers';

const helpers = Object.assign({}, HelperContainer.data, HelperContainer.local);

export function GRIDDLE_LOADED_DATA(state, action) {
  //set state's data to this
  const tempState = state
  .set('data', Immutable.fromJS(action.data));

  return tempState
  .set('visibleData', helpers.getVisibleData(state))
  .set('renderProperties', Immutable.fromJS(action.properties))
  .setIn(
    ['pageProperties', 'maxPage'],
    helpers.getPageCount(
      action.data.length,
      state.getIn(['pageProperties', 'pageSize'])));
}


export function GRIDDLE_SET_PAGE_SIZE(state, action) {
  return state
    .setIn(['pageProperties', 'pageSize'], action.pageSize);
}

export function GRIDDLE_GET_PAGE(state, action) {
  return(helpers
    .getPage(state, action.pageNumber));
}

export function GRIDDLE_NEXT_PAGE(state, action) {
  return(helpers
    .getPage(state,
    state.getIn(['pageProperties', 'currentPage']) + 1));
}

export function GRIDDLE_PREVIOUS_PAGE(state, action) {
  return(helpers
      .getPage(state,
      state.getIn(['pageProperties', 'currentPage']) - 1));
}

export function GRIDDLE_FILTERED(state, action) {
  if(action.filter === "") {
    const newState = state
      .set('filteredData', Immutable.fromJS([]))
      .setIn(['pageProperties', 'currentPage'], 1)
      .set('filter', '')

      return newState
        .setIn(
          ['pageProperties', 'maxPage'],
          helpers.getPageCount(
            //use getDataSet to make sure we're not getting rid of sort/etc
            helpers.getDataSet(newState).length,
            newState.getIn(['pageProperties', 'pageSize'])));
  }

  return helpers.filter(state, action.filter);
}

//TODO: This is a really simple sort, for now
//      We need to add sort type and different sort operations
export function GRIDDLE_SORT(state, action) {
  if(!action.sortColumns || action.sortColumns.length < 1) { return state }

  return helpers.sortByColumns(state, action.sortColumns)
}