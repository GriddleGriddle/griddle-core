var AppDispatcher = require('../dispatcher/app-dispatcher');
var DataStore = require('../stores/local-data-store');

module.exports ={
  loadData: function(data){
    var action = {
      actionType: "GRIDDLE_LOADED_DATA",
      data: data
    }

    AppDispatcher.dispatch(action); 
  },
  filterData: function(filter){
    if(filter === ""){
      var action = {
        actionType: "GRIDDLE_FILTER_REMOVED"
      }

      AppDispatcher.dispatch(action);
      return;
    }

    var action = {
      actionType: "GRIDDLE_FILTERED",
      filter: filter
    };

    AppDispatcher.dispatch(action); 
  },
  setPageSize: function(pageSize){
    var action = {
      actionType: "GRIDDLE_SET_PAGE_SIZE",
      pageSize: pageSize
    }
  },
  sort: function(column){
    var action = {
      actionType: "GRIDDLE_SORT", 
      sortColumns: [column]
    };
  },
  addSortColumn: function(column){
    var action = {
      actionType: "GRIDDLE_ADD_SORT_COLUMN",
      sortColumn: column
    }
  }
}