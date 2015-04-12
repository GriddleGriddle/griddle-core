var AppDispatcher = require('../dispatcher/app-dispatcher');
var assign = require('object-assign');
var StoreBoilerplate = require('./store-boilerplate');
var Constants = require('../constants/constants');
var _ = require('lodash');

var _state = {
  xScrollPosition: 0,
  xScrollMax: 0,
  yScrollPosition: 0,
  yScrollMax: 0,
  tableHeight: 400,
  tableWidth: 900,
  rowHeight: 25,
  infiniteScrollLoadTreshold: 50
};

var ScrollStore = assign({}, StoreBoilerplate, {
  getScrollProperties: function(){
    return _state;
  },

  getXScrollPosition: function(){
    return _state.xScrollPosition;
  },

  getXScrollMax: function(){
    return _state.xScrollMax;
  },

  getYScrollPosition: function(){
    return _state.yScrollPosition;
  },

  getYScrollMax: function(){
    return _state.yScrollMax;
  },

  getTableHeight: function(){
    return _state.tableHeight;
  },

  getTableWidth: function(){
    return _state.tableWidth;
  },

  getRowHeight: function(){
    return _state.rowHeight;
  },

  dispatchToken: AppDispatcher.register(function(action){
    switch(action.actionType){
      case Constants.TABLE_DIMENSIONS_CHANGED:
        _state.tableHeight = action.tableHeight;
        _state.tableWidth = action.tableWidth;
        ScrollStore.emitChange();
      case Constants.ROW_HEIGHT_CHANGED:
        _state.rowHeight = action.rowHeight;
        ScrollStore.emitChange();
      case Constants.XY_POSITION_CHANGED:
        _state.xScrollPosition = action.xScrollPosition;
        _state.xScrollMax = action.xScrollMax;
        _state.yScrollPosition = action.yScrollPosition;
        _state.yScrollMax = action.yScrollMax;
        ScrollStore.emitChange();
        break;
      default:
    }
  })
});

module.exports = ScrollStore;
