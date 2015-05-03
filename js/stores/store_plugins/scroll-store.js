var Constants = require('../../constants/constants');
var ScrollStore = require('../scroll-store');
 var ScrollPlugin = function(_state){
  return {
    helpers: {
    setCurrentDataPage(gridId){
      var adjustedHeight = this.getAdjustedRowHeight(gridId);
      var visibleRecordCount = Math.ceil(_state[gridId].scrollProperties.tableHeight / adjustedHeight);

      // Inspired by : http://jsfiddle.net/vjeux/KbWJ2/9/
      _state[gridId].pageProperties.initialDisplayIndex = Math.max(0, Math.floor(_state[gridId].scrollProperties.yScrollPosition / adjustedHeight) - visibleRecordCount * 0.25);
      _state[gridId].pageProperties.lastDisplayIndex = Math.min(_state[gridId].pageProperties.initialDisplayIndex + visibleRecordCount * 1.25, this.getAllVisibleData(gridId).length - 1) + 1;
    },

    shouldUpdateDrawnRows: function(oldScrollProperties, gridId){
      return oldScrollProperties === undefined ||
        Math.abs(oldScrollProperties.yScrollPosition - _state[gridId].scrollProperties.yScrollPosition) >= this.getAdjustedRowHeight(gridId);
    },

    shouldUpdateDrawnColumns: function(oldVisibleColumnProperties, gridId){
      return oldVisibleColumnProperties === undefined ||
             _state[gridId].visibleColumnProperties.initialDisplayIndex != oldVisibleColumnProperties.initialDisplayIndex ||
             _state[gridId].visibleColumnProperties.lastDisplayIndex != oldVisibleColumnProperties.lastDisplayIndex;
    },

    updateVisibleColumnProperties: function(gridId){
      if (_state[gridId].data && _state[gridId].data.length > 0){
        // Load the width of the columns.
        var columnWidth = this.getAdjustedColumnWidth(gridId);

        // Update the indexes.
        _state[gridId].visibleColumnProperties.initialDisplayIndex = Math.floor(_state[gridId].scrollProperties.xScrollPosition / columnWidth) - 1;
        _state[gridId].visibleColumnProperties.lastDisplayIndex = _state[gridId].visibleColumnProperties.initialDisplayIndex + Math.ceil(_state[gridId].scrollProperties.tableWidth / columnWidth) + 1;
        _state[gridId].visibleColumnProperties.maxColumnLength = Object.keys(_state[gridId].data[0]).length;

        // Make sure that the first index is at least 0.
        if (_state[gridId].visibleColumnProperties.initialDisplayIndex < 0) {
          _state[gridId].visibleColumnProperties.initialDisplayIndex = 0;
        }

        // If there aren't enough available columns, set to the max length of properties.
        if (_state[gridId].visibleColumnProperties.maxColumnLength < _state[gridId].visibleColumnProperties.lastDisplayIndex) {
          _state[gridId].visibleColumnProperties.lastDisplayIndex = _state[gridId].visibleColumnProperties.maxColumnLength;
        }
      } else {
        // Set indexes to '0' if there's no data.
        _state[gridId].visibleColumnProperties.initialDisplayIndex = _state[gridId].visibleColumnProperties.lastDisplayIndex = 0;
      }
    },

    shouldLoadNewPage: function(gridId){
      _state[gridId].pageProperties.infiniteScroll &&
      _state[gridId].pageProperties.lastDisplayIndex !== this.getAllVisibleData(gridId).length &&
      _state[gridId].pageProperties.currentPage !== _state[gridId].pageProperties.maxPage &&
      function(){
          // Determine the diff by subtracting the amount scrolled by the total height, taking into consideratoin
          // the spacer's height.
          var scrollHeightDiff = _state[gridId].scrollProperties.yScrollMax - (_state[gridId].scrollProperties.yScrollPosition + _state[gridId].scrollProperties.tableHeight) - _state[gridId].scrollProperties.infiniteScrollLoadTreshold;

          // Make sure that we load results a little before reaching the bottom.
          var compareHeight = scrollHeightDiff * 0.6;

          // Send back whether or not we're under the threshold.
          return compareHeight <= _state[gridId].scrollProperties.infiniteScrollLoadTreshold;
      }();
    },

    getAdjustedRowHeight: function(gridId){
      return _state[gridId].scrollProperties.rowHeight; //+ this.props.paddingHeight * 2; // account for padding.
    },

    getAdjustedColumnWidth: function(gridId){
      return _state[gridId].scrollProperties.columnWidth; //+ this.props.paddingHeight * 2; // account for padding.
    },

    columnsHaveUpdated: function(gridId){
       // Compute the new visible column properties.
      var oldColumnProperties = _.clone(_state[gridId].visibleColumnProperties);
      helpers.updateVisibleColumnProperties(gridId);

      if (helpers.shouldUpdateDrawnColumns(oldColumnProperties, gridId)){
        helpers.setVisibleColumns(gridId);
        return true;
      } else {
        return false;
      }
    },

    rowsHaveUpdated: function(gridId, oldScrollProperties){
      // If the scroll position changes and the drawn rows need to update, do so.
      if (helpers.shouldUpdateDrawnRows(oldScrollProperties, gridId)){
        // Update the current displayed rows
        this.helpers.setCurrentDataPage(gridId);
        return true;
      } else {
        return false;
      }
    },

    updateScrollProperties: function(gridId){
      // Load the new scrollProperties
      var oldScrollProperties = _state[gridId].scrollProperties;
      _state[gridId].scrollProperties = _.clone(ScrollStore.getScrollProperties(gridId));
      if (helpers.rowsHaveUpdated(gridId, oldScrollProperties) || helpers.columnsHaveUpdated(gridId)) {

        // Update whether or not we should automatically load the next page.
        _state[gridId].pageProperties.shouldAutoLoadNextPage = helpers.shouldLoadNewPage(gridId);
        // Emit the change.
        DataStore.emitChange();
      }
    },

    checkIfShouldLoadNextPage: function(gridId){
        return;
    }
  },

  //these are plugins -- they run after the actions in the parent
  //they should not emit
  registeredCallbackPlugins: function(action){
    switch(action.actionType){
      case Constants.GRIDDLE_INITIALIZED:
        // Set the initial scroll properties.
        _state[action.gridId].scrollProperties = _.clone(ScrollStore.getScrollProperties(action.gridId));
        break;
      case Constants.GRIDDLE_LOADED_DATA:
        this.helpers.updateVisibleColumnProperties(action.gridId);
        break;
      default:
    }
  },

  registeredCallbacks: function(action) {
    switch(action.actionType) {
      //listing this one here because it's method emits
      case Constants.XY_POSITION_CHANGED:
        helpers.updateScrollProperties(action.gridId);
        break;
      default:
    }
  }
}
}

module.exports = ScrollPlugin;
