var AppDispatcher = require('../dispatcher/app-dispatcher');
var scrollConstants = require('../constants/scroll-constants');
var assign = require('object-assign');
var EventEmitter = require('eventemitter3').EventEmitter;

var _state = {
  xScrollPosition: 0,
  yScrollPosition: 0
};

var ScrollStore = assign({}, EventEmitter.prototype, {

  emitChange: function(){
    this.emit('change');
  },

  addChangeListener: function(callback){
    this.on('change', callback);
  },

  removeChangeListener: function(callback){
    this.removeListener('change', callback);
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
});

AppDispatcher.register(function(action){
  switch(action.actionType){
    case scrollConstants.XY_POSITION_CHANGED:
      _state.xScrollPosition = action.xScrollPosition;
      _state.yScrollPosition = action.yScrollPosition;
      ScrollStore.emitChange();
      break;
    default:
  }
});


module.exports = ScrollStore;
