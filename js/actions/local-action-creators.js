var AppDispatcher = require('../dispatcher/app-dispatcher');
var DataStore = require('../stores/data-store');
var DataHelper = require('../helpers/data-helper');

module.exports ={
  loadData: function(data){
    var action = {
      actionType: "GRIDDLE_LOADED_DATA",
      data: data
    }

    AppDispatcher.dispatch(action); 
  },
  filterData: function(filter){
    var data = DataStore.getAllData(); 

    if(filter === ""){
      var action = {
        actionType: "GRIDDLE_FILTER_REMOVED"
      }

      AppDispatcher.dispatch(action);
      return;
    }

    var filtered = DataHelper.filterAllData(filter, data); 

    var action = {
      actionType: "GRIDDLE_FILTERED",
      data: filtered
    };

    AppDispatcher.dispatch(action); 
  }
}