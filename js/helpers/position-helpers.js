'use strict';

export function getRenderedData(state) {
  state = state;
  return state.get('renderedData');
}

export function getPositionData(state) {
  state = state;
  return state.get('currentPosition').toJS();
}

export function shouldUpdateDrawnRows(action, state) {
  let yScrollChangePosition = state.getIn(['currentPosition', 'yScrollChangePosition']);
  let rowHeight = state.getIn(['currentPosition', 'rowHeight']);

  return Math.abs(action.yScrollPosition - yScrollChangePosition) >= rowHeight;
}

export function updatePositionProperties(action, state, helpers, force) {
  if (!action.force && !helpers.shouldUpdateDrawnRows(action, state)) {
    return state; // Indicate that this shouldn't result in an emit.
  }
  let rowHeight = state.getIn(['currentPosition', 'rowHeight']);
  let tableHeight = state.getIn(['currentPosition', 'tableHeight']);

  let adjustedHeight = rowHeight;
  let visibleRecordCount = Math.ceil(tableHeight / adjustedHeight);

  let visibleDataLength = helpers.getDataSet(state).count();

  // Inspired by : http://jsfiddle.net/vjeux/KbWJ2/9/
  let renderedStartDisplayIndex = Math.max(0, Math.floor(Math.floor(action.yScrollPosition / adjustedHeight) - visibleRecordCount * 0.25));
  let renderedEndDisplayIndex = Math.min(Math.floor(renderedStartDisplayIndex + visibleRecordCount * 1.25), visibleDataLength - 1) + 1;

  return state
    .setIn(['currentPosition', 'renderedStartDisplayIndex'], renderedStartDisplayIndex)
    .setIn(['currentPosition', 'renderedEndDisplayIndex'], renderedEndDisplayIndex)
    .setIn(['currentPosition', 'visibleDataLength'], visibleDataLength)
    .setIn(['currentPosition', 'yScrollChangePosition'], action.yScrollPosition)
    .setIn(['currentPosition', 'xScrollChangePosition'], action.xScrollPosition);
}

export function updateRenderedData(state, helpers) {
  let startDisplayIndex = state.getIn(['currentPosition', 'renderedStartDisplayIndex']);
  return state
    .set('renderedData', helpers.getDataSet(state)
                          .skip(startDisplayIndex)
                          .take(state.getIn(['currentPosition', 'renderedEndDisplayIndex']) - startDisplayIndex));
}