var AppDispatcher = require('../dispatcher/app-dispatcher');

module.exports ={
  loadData: function(data){
    var action = {
      actionType: "GRIDDLE_LOADED_DATA",
      data: data
    }

    AppDispatcher.dispatch(action); 
  }
}