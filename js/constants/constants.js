var keyMirror = require('react/lib/keyMirror');

/*
  It should be noted that the action types that are like
  GRIDDLE_FILTER mean that the operation has started.
  Past tense action types mean that the operation 
  has completed.
*/
module.exports = keyMirror({
  GRIDDLE_FILTER: null,
  GRIDDLE_FILTERED: null,
  GRIDDLE_FILTER_BY_COLUMN: null,
  GRIDDLE_FILTERED_BY_COLUMN: null,
  GRIDDLE_FILTER_BY_ADDITIONAL_COLUMN: null,
  GRIDDLE_FILTERED_BY_ADDITIONAL_COLUMN: null,
  GRIDDLE_FILTER_REMOVED: null,
  GRIDDLE_SORT: null,
  GRIDDLE_SORTED: null,
  GRIDDLE_SORT_ADDITIONAL: null,
  GRIDDLE_SORTED_ADDITIONAL: null,
  GRIDDLE_LOAD_DATA: null,
  GRIDDLE_LOADED_DATA: null,
  GRIDDLE_NEXT_PAGE: null,
  GRIDDLE_PREVIOUS_PAGE: null,
  GRIDDLE_GET_PAGE: null,
  GRIDDLE_PAGE_LOADED: null,
  GRIDDLE_SET_PAGE_SIZE: null,
  GRIDDLE_INITIALIZE: null,
  GRIDDLE_INITIALIZED: null,
  GRIDDLE_REMOVED: null,
  XY_POSITION_CHANGE: null,
  XY_POSITION_CHANGED: null,
  TABLE_DIMENSIONS_CHANGED: null,
  ROW_HEIGHT_CHANGED: null
});
