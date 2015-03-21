var AppDispatcher = require('../dispatcher/app-dispatcher');

var assign = require('object-assign'); 
var EventEmitter = require('eventemitter3').EventEmitter;
var _state = {
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

  getVisibleData: function(){
    return _state.visibleData.length > 0 ? _state.visibleData : _state.data;
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
      DataStore.emitChange(); 
      break;
    default:
  }

});

module.exports = DataStore; 