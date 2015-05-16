'use strict';
import StoreBoilerplate from './store-boilerplate';
import Immutable from 'immutable';

var defaultPositionState = {
  xScrollChangePosition: 0,
  yScrollChangePosition: 0,
  renderedStartDisplayIndex: 0,
  renderedEndDisplayIndex: 0,
  tableHeight: 400,
  tableWidth: 200,
  rowHeight: 25,
  defaultColumnWidth: 80,
  infiniteScrollLoadTreshold: 50
};

class PositionPlugin extends StoreBoilerplate {
  constructor(){
    super();
  }

  initializeState(state) {
    debugger;
    //default state modifications for this plugin
    return state
      .set('position', Immutable.fromJS(defaultPositionState))
      .set('renderedData', Immutable.fromJS([]));
  }

  get RegisteredCallbacks() {
    return {
      GRIDDLE_LOADED_DATA(action, state) {
        return PositionPlugin.updateRenderedData(state);
      },
      GRIDDLE_NEXT_PAGE(action, state) {
        return PositionPlugin.updateRenderedData(state);
      },
      GRIDDLE_PREVIOUS_PAGE(action, state) {
        return PositionPlugin.updateRenderedData(state);
      },
      GRIDDLE_FILTERED(action, state) {
        return PositionPlugin.updateRenderedData(state);
      },
      GRIDDLE_SORT(action, state) {
        return PositionPlugin.updateRenderedData(state);
      },
      XY_POSITION_CHANGED(action, state) {
        return PositionPlugin.updatePositionProperties(action, state);
        return PositionPlugin.updateRenderedData(state);
      }
    };
  }

  get Helpers() {
    return {
      getRenderedData() {
        return this.state.get('renderedData');
      }
    };
  }

  static shouldUpdateDrawnRows(action, currentPosition) {
    return Math.abs(action.yScrollPosition - currentPosition.yScrollChangePosition) >= currentPosition.rowHeight;
  }

  static updatePositionProperties(action, state) {
    var position = this.state.get('position');

    if (PositionPlugin.shouldUpdateDrawnRows(action, position)) {
      return null; // Indicate that this shouldn't result in an emit.
    }

    var adjustedHeight = position.rowHeight;
    var visibleRecordCount = Math.ceil(position.tableHeight / adjustedHeight);

    // Inspired by : http://jsfiddle.net/vjeux/KbWJ2/9/
    position.renderedStartDisplayIndex = Math.max(0, Math.floor(action.yScrollPosition / adjustedHeight) - visibleRecordCount * 0.25);
    position.renderedEndDisplayIndex = Math.min(position.renderedStartDisplayIndex + visibleRecordCount * 1.25, this.getVisibleData().length - 1) + 1;

    return state
      .setIn(['position', 'renderedStartDisplayIndex'], renderedStartDisplayIndex)
      .setIn(['position', 'renderedEndDisplayIndex'], renderedEndDisplayIndex);
  }

  static updateRenderedData(state) {
    let startDisplayIndex = state.getIn(['position', 'renderedStartDisplayIndex']) - 1;
    return state
      .set('renderedData', this.getVisibleData()
                            .skip(startDisplayIndex)
                            .take(state.getIn(['position', 'renderedEndDisplayIndex']) - startDisplayIndex));
  }
}

export default PositionPlugin;
