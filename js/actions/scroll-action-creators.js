var AppDispatcher = require('../dispatcher/app-dispatcher');
var Constants = require('../constants/constants');

module.exports = {
  initializeScrollStore: function(gridId){
    AppDispatcher.dispatch({
      gridId: gridId,
      actionType: Constants.GRIDDLE_INITIALIZE
    });
  },
  setScrollPosition: function(gridId, xScrollPosition, xScrollMax, yScrollPosition, yScrollMax){
    // Fire off initial dispatch
    AppDispatcher.dispatch({
      gridId: gridId,
      actionType: Constants.XY_POSITION_CHANGE,
      xScrollPosition: xScrollPosition,
      xScrollMax: xScrollMax,
      yScrollPosition: yScrollPosition,
      yScrollMax: yScrollMax
    });

    // Fire off follow up action 
    AppDispatcher.dispatch({
      gridId: gridId,
      actionType: Constants.XY_POSITION_CHANGED
    });
  }
}
