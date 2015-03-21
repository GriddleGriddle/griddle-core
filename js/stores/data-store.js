var AppDispatcher = require('../dispatcher/app-dispatcher');

var assign = require('object-assign'); 
var EventEmitter = require('eventemitter3').EventEmitter;
var _state = {
  data: []
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

  getData: function(){
    return _state.data;
  }
});

AppDispatcher.register(function(action){
  switch(action.actionType){
    case "GRIDDLE_LOADED_DATA":
    _state.data = action.data;
    DataStore.emitChange(); 
  }

});

module.exports = DataStore; 