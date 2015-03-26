var AppDispatcher = require('../dispatcher/app-dispatcher');
var assign = require('object-assign');
var StoreBoilerplate = require('./store-boilerplate');
var Constants = require('../constants/constants');

var _state = {
  xScrollPosition: 0,
  yScrollPosition: 0
};

var ScrollStore = assign({}, StoreBoilerplate, {
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
    case Constants.XY_POSITION_CHANGED:
      _state.xScrollPosition = action.xScrollPosition;
      _state.yScrollPosition = action.yScrollPosition;
      ScrollStore.emitChange();
      break;
    default:
  }
});


module.exports = ScrollStore;
