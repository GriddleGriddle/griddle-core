var AppDispatcher = require('../dispatcher/app-dispatcher');
var Constants = require('../constants/constants');

module.exports = {
  setScrollPosition: function(xScrollPosition, yScrollPosition){
    var action = {
      actionType: Constants.XY_POSITION_CHANGED,
      xScrollPosition: xScrollPosition,
      yScrollPosition: yScrollPosition
    }

    AppDispatcher.dispatch(action);
  }
}
