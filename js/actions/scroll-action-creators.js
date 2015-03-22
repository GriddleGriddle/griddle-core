var AppDispatcher = require('../dispatcher/app-dispatcher');
var scrollStore = require('../stores/scroll-store');
var scrollConstants = require('../constants/scroll-constants');

module.exports = {
  setScrollPosition: function(xScrollPosition, yScrollPosition){
    var action = {
      actionType: scrollConstants.XY_POSITION_CHANGED,
      xScrollPosition: xScrollPosition,
      yScrollPosition: yScrollPosition
    }

    AppDispatcher.dispatch(action);
  }
}
