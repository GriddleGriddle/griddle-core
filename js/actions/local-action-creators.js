var AppDispatcher = require('../dispatcher/app-dispatcher');
var DataStore = require('../stores/data-store');

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

    var filtered = _.filter(data, function(record){
      var items = _.values(record);
      for(var i = 0; i < items.length; i++){
         if ((items[i]||"").toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0){
          return true;
         }
      }

      return false;      
    });

    var action = {
      actionType: "GRIDDLE_FILTERED",
      data: filtered
    };

    AppDispatcher.dispatch(action); 
  }
}