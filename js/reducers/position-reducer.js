export function XY_POSITION_CHANGED(state, action, helpers) {
  state = helpers.updatePositionProperties(action, state, helpers);
  return helpers.updateRenderedData(state, helpers);
}

export function GRIDDLE_LOADED_DATA_AFTER(state, action, helpers) {
  state = helpers.updatePositionProperties({ yScrollPosition: 0, xScrollPosition: 0, force: true}, state, helpers, true);
  return  helpers.updateRenderedData(state, helpers);
}

export function GRIDDLE_NEXT_PAGE_AFTER(state, action, helpers) {
  return helpers.updateRenderedData(state, helpers);
}

export function GRIDDLE_PREVIOUS_PAGE_AFTER(state, action, helpers) {
  return helpers.updateRenderedData(state, helpers);
}

export function GRIDDLE_FILTERED_AFTER(state, action, helpers) {
  return helpers.updateRenderedData(state, helpers);
}

export function GRIDDLE_SORT_AFTER(state, action, helpers) {
  return helpers.updateRenderedData(state, helpers);
}