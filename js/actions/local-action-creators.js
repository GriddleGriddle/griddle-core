var AppDispatcher = require('../dispatcher/app-dispatcher');
var Constants = require('../constants/constants');

module.exports ={
  loadData: function(data){
    var action = {
      actionType: Constants.GRIDDLE_LOADED_DATA,
      data: data
    }

    AppDispatcher.dispatch(action); 
  },
  filterData: function(filter){
    if(filter === ""){
      var action = {
        actionType: Constants.GRIDDLE_FILTER_REMOVED
      }

      AppDispatcher.dispatch(action);
      return;
    }

    var action = {
      actionType: Constants.GRIDDLE_FILTERED,
      filter: filter
    };

    AppDispatcher.dispatch(action); 
  },
  setPageSize: function(pageSize){
    var action = {
      actionType: Constants.GRIDDLE_SET_PAGE_SIZE,
      pageSize: pageSize
    }
  },
  sort: function(column){
    var action = {
      actionType: Constants.GRIDDLE_SORT, 
      sortColumns: [column]
    };
  },
  addSortColumn: function(column){
    var action = {
      actionType: Constants.GRIDDLE_ADD_SORT_COLUMN,
      sortColumn: column
    }
  }
}