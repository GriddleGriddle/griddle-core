var AppDispatcher = require('../dispatcher/app-dispatcher');
var assign = require('object-assign');
var StoreBoilerplate = require('./store-boilerplate');
var Constants = require('../constants/constants');

var _state = {
  xScrollPosition: 0,
  yScrollPosition: 0,
  tableHeight: 400,
  tableWidth: 900,
  rowHeight: 25
};

var ScrollStore = assign({}, StoreBoilerplate, {
  getScrollProperties: function(){
    return _state;
  },
  
  getXScrollPosition: function(){
    return _state.xScrollPosition;
  },

  setXScrollPosition: function(position){
    _state.xScrollPosition = position;
  },

  getYScrollPosition: function(){
    return _state.yScrollPosition;
  },

  setYScrollPosition: function(position){
    _state.yScrollPosition = position;
  },

  getTableHeight: function(){
    return _state.tableHeight;
  },

  setTableHeight: function(tableHeight){
    _state.tableHeight = tableHeight;
  },

  getTableWidth: function(){
    return _state.tableWidth;
  },

  setTableWidth: function(tableWidth){
    _state.tableWidth = tableWidth;
  },

  getRowHeight: function(){
    return _state.rowHeight;
  },

  setRowHeight: function(rowHeight){
    _state.rowHeight = rowHeight;
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
        _state.yScrollPosition = action.yScrollPosition;
        ScrollStore.emitChange();
        break;
      default:
    }
  })
});

module.exports = ScrollStore;
