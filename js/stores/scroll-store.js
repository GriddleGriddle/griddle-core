var AppDispatcher = require('../dispatcher/app-dispatcher');
var assign = require('object-assign');
var StoreBoilerplate = require('./store-boilerplate');
var Constants = require('../constants/constants');
var _ = require('lodash');

var defaultGridState = {
  xScrollPosition: 0,
  xScrollMax: 0,
  yScrollPosition: 0,
  yScrollMax: 0,
  tableHeight: 400,
  tableWidth: 200,
  rowHeight: 25,
  columnWidth: 80,
  infiniteScrollLoadTreshold: 50
};

var _state = {};

var ScrollStore = assign({}, StoreBoilerplate, {
  getScrollProperties: function(gridId){
    return _state[gridId];
  },

  getXScrollPosition: function(gridId){
    return _state[gridId].xScrollPosition;
  },

  getXScrollMax: function(gridId){
    return _state[gridId].xScrollMax;
  },

  getYScrollPosition: function(gridId){
    return _state[gridId].yScrollPosition;
  },

  getYScrollMax: function(gridId){
    return _state[gridId].yScrollMax;
  },

  getTableHeight: function(gridId){
    return _state[gridId].tableHeight;
  },

  getTableWidth: function(gridId){
    return _state[gridId].tableWidth;
  },

  getRowHeight: function(gridId){
    return _state[gridId].rowHeight;
  },

  getColumnWidth: function(gridId){
    return _state[gridId].columnWidth;
  },

  dispatchToken: AppDispatcher.register(function(action){
    switch(action.actionType){
      case Constants.GRIDDLE_INITIALIZED: 
        //assign new state object
        var state = assign({}, defaultGridState);
        _state[action.gridId] = state; 
        ScrollStore.emitChange();
        break;
      case Constants.GRIDDLE_REMOVED:
        //remove the item from the hash
        delete _state[action.gridId];
        ScrollStore.emitChange();
        break;
      case Constants.TABLE_DIMENSIONS_CHANGED:
        _state[action.gridId].tableHeight = action.tableHeight;
        _state[action.gridId].tableWidth = action.tableWidth;
        ScrollStore.emitChange();
      case Constants.ROW_HEIGHT_CHANGED:
        _state[action.gridId].rowHeight = action.rowHeight;
        ScrollStore.emitChange();
      case Constants.XY_POSITION_CHANGED:
        _state[action.gridId].xScrollPosition = action.xScrollPosition;
        _state[action.gridId].xScrollMax = action.xScrollMax;
        _state[action.gridId].yScrollPosition = action.yScrollPosition;
        _state[action.gridId].yScrollMax = action.yScrollMax;
        ScrollStore.emitChange();
        break;
      default:
    }
  })
});

module.exports = ScrollStore;
