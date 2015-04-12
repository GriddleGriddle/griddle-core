var AppDispatcher = require('../dispatcher/app-dispatcher');
var Constants = require('../constants/constants');

module.exports = {
  setScrollPosition: function(xScrollPosition, xScrollMax, yScrollPosition, yScrollMax){
    var action = {
      actionType: Constants.XY_POSITION_CHANGED,
      xScrollPosition: xScrollPosition,
      xScrollMax: xScrollMax,
      yScrollPosition: yScrollPosition,
      yScrollMax: yScrollMax
    }

    AppDispatcher.dispatch(action);
  }
}
