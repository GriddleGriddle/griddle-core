var AppDispatcher = require('../dispatcher/app-dispatcher');

var assign = require('object-assign'); 
var EventEmitter = require('eventemitter3').EventEmitter;
var _state = {
  hasFilter: false,
  data: [],
  visibleData: [],
  pageProperties: { current: 0, max: 0 }
};


var DataStore = assign({}, EventEmitter.prototype, {

  emitChange: function(){
    this.emit('change'); 
  },

  addChangeListener: function(callback){
    this.on('change', callback);
  },

  removeChangeListener: function(callback){
    this.removeListener('change', callback);
  }, 

  getAllData: function(){
    return _state.data;
  },

  //this determines whether the data array or visible data array should be used
  showVisibleData: function(){
    if(_state.hasFilter === true){
      return true;
    }
  },
  getVisibleData: function(){
    return this.showVisibleData() ? _state.visibleData : _state.data;
  }
});

AppDispatcher.register(function(action){
  switch(action.actionType){
    case "GRIDDLE_LOADED_DATA":
      _state.data = action.data;
      DataStore.emitChange(); 
      break;
    case "GRIDDLE_FILTERED":
      _state.visibleData = action.data;
      _state.pageProperties.current = 0;
      _state.hasFilter = true; 
      DataStore.emitChange(); 
      break;
    case "GRIDDLE_FILTER_REMOVED":
      _state.hasFilter = false;
      DataStore.emitChange();
    default:
  }

});

module.exports = DataStore; 