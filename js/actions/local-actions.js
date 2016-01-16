import * as types from '../constants/action-types';

export function initializeGrid(){
  return {
    type: types.GRIDDLE_INITIALIZED
  };
}

export function removeGrid() {
  return {
    type:  types.GRIDDLE_REMOVED
  }
}

export function loadData(data, properties) {
  return {
    type: types.GRIDDLE_LOADED_DATA,
    data,
    properties
  };
}

export function filterData(filter) {
  return {
    type: types.GRIDDLE_FILTERED,
    filter:filter
  };
}

export function setPageSize(pageSize) {
  return {
    type: types.GRIDDLE_SET_PAGE_SIZE,
    pageSize
  }
}

export function sort(column){
  return {
    type: types.GRIDDLE_SORT,
    sortColumns: [column]
  };
}

export function addSortColumn(column){
  return {
    type: types.GRIDDLE_ADD_SORT_COLUMN,
    sortColumn: column
  };
}

export function loadNext(){
  return {
    type: types.GRIDDLE_NEXT_PAGE
  };
}

export function loadPrevious(){
  return {
    type: types.GRIDDLE_PREVIOUS_PAGE
  };
}

export function loadPage(number){
  return {
    type: types.GRIDDLE_GET_PAGE,
    pageNumber: number
  };
}

export function toggleColumn(columnId) {
  return {
    type: types.GRIDDLE_TOGGLE_COLUMN,
    columnId
  };
}
