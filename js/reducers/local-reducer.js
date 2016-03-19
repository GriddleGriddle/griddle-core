import * as types from '../constants/action-types';
import Immutable from 'immutable';
import reselect from 'reselect';
import { addKeyToRows } from '../utils/dataUtils';

/*
  The handler that happens when data is loaded.
  Needs to set the:
    Properties,
    Data,
    Pagination buttons
    visible data
    it should sort the data if a sort is specified
*/
export function GRIDDLE_LOADED_DATA(state, action) {
  const columns = action.data.length > 0 ? Object.keys(action.data[0]) : [];

  //set state's data to this
  return state
  .set('data', addKeyToRows(Immutable.fromJS(action.data)))
  .set('allColumns', columns)
  .set('loading', false);
}

//TODO: This should go away
export function AFTER_REDUCE(state, action) {
  return state;
}

/*
  Needs to update:
    visible data,
    max pages,
    hasNext,
    hasPrevious
*/
export function GRIDDLE_SET_PAGE_SIZE(state, action) {
  return state
    .setIn(['pageProperties', 'currentPage'], 1)
    .setIn(['pageProperties', 'pageSize'],
      action.pageSize);
}

//TODO: Move the helper function to the method body and call this
//      from next / previous. This will be easier since we have
//      the AFTER_REDUCE stuff now.
export function GRIDDLE_GET_PAGE(state, action) {
  return state.setIn(['pageProperties', 'currentPage'], action.pageNumber)
}


export function GRIDDLE_NEXT_PAGE(state, action) {
  const currentPage = state.getIn(['pageProperties', 'currentPage']);
  const maxPage = state.getIn(['pageProperties', 'maxPage']);

  return currentPage < maxPage ?
    state.setIn(['pageProperties', 'currentPage'], currentPage + 1) :
    state;
}

export function GRIDDLE_PREVIOUS_PAGE(state, action) {
  const currentPage = state.getIn(['pageProperties', 'currentPage']);

  return currentPage > 0 ?
    state.setIn(['pageProperties', 'currentPage'], currentPage - 1) :
    state
}

export function GRIDDLE_FILTERED(state, action) {
  //TODO: Just set the filter and let the visible data handle what is actually shown + next / previous
  return state
    .set('filter', action.filter)
    .setIn(['pageProperties','currentPage'], 1);
}

//TODO: This is a really simple sort, for now
//      We need to add sort type and different sort operations
export function GRIDDLE_SORT(state, action) {
  if(!action.sortColumns || action.sortColumns.length < 1) { return state }

  const sortDirections = state.get('sortDirections').size !== 0 && (state.get('sortDirections').size > 0 &&
    state.get('sortDirections').first() === true &&
    state.get('sortColumns')[0] === action.sortColumns[0]) ?
      Immutable.List([!state.get('sortDirections').first()]) :
      Immutable.List([true]);

  return state
    .setIn(['pageProperties', 'currentPage'], 1)
    .set('sortColumns', action.sortColumns)
    .set('sortDirections', sortDirections)
}


