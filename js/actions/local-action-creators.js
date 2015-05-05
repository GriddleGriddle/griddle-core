var AppDispatcher = require('../dispatcher/app-dispatcher');
var Constants = require('../constants/constants');
var ScrollActions = require('./scroll-action-creators');

module.exports ={
  initializeGrid: function(gridId){
    //Initialize all dependents.
    ScrollActions.initializeScrollStore(gridId);

    // Continue initializing
    var action = {
      gridId: gridId,
      actionType: Constants.GRIDDLE_INITIALIZED
    }

    AppDispatcher.dispatch(action);

  },
  removeGrid: function(gridId){
    var action = {
      gridId: gridId, 
      actionType: Constants.GRIDDLE_REMOVED
    }
  },
  loadData: function(gridId, data, columnMetadata){
    var action = {
      actionType: Constants.GRIDDLE_LOADED_DATA,
      gridId: gridId, 
      data: data,
      columnMetadata: columnMetadata
    }

    AppDispatcher.dispatch(action); 
  },
  filterData: function(gridId, filter){
    if(filter === ""){
      var action = {
        gridId: gridId, 
        actionType: Constants.GRIDDLE_FILTER_REMOVED
      }

      AppDispatcher.dispatch(action);
      return;
    }

    var action = {
      gridId: gridId, 
      actionType: Constants.GRIDDLE_FILTERED,
      filter: filter
    };

    AppDispatcher.dispatch(action); 
  },
  setPageSize: function(gridId, pageSize){
    var action = {
      gridId: gridId,      
      actionType: Constants.GRIDDLE_SET_PAGE_SIZE,
      pageSize: pageSize
    }

    AppDispatcher.dispatch(action);
  },
  sort: function(gridId, column){
    var action = {
      gridId: gridId,      
      actionType: Constants.GRIDDLE_SORT, 
      sortColumns: [column]
    };

    AppDispatcher.dispatch(action);
  },
  addSortColumn: function(gridId, column){
    var action = {
      gridId: gridId,
      actionType: Constants.GRIDDLE_ADD_SORT_COLUMN,
      sortColumn: column
    }

    AppDispatcher.dispatch(action);
  },
  loadNext: function(gridId){
    var action = {
      gridId: gridId,            
      actionType: Constants.GRIDDLE_NEXT_PAGE
    };

    AppDispatcher.dispatch(action);
  },

  loadPrevious: function(gridId){
    var action = {
      gridId: gridId,     
      actionType: Constants.GRIDDLE_PREVIOUS_PAGE
    };

    AppDispatcher.dispatch(action);
  },

  loadPage: function(gridId, number){
    var action = { 
      gridId: gridId,
      actionType: Constants.GRIDDLE_GET_PAGE,
      pageNumber: number
    }

    AppDispatcher.dispatch(action);
  },

  resizeColumn: function(gridId, column, change){
    var action = { 
      gridId: gridId,
      actionType: Constants.COLUMN_RESIZE,
      column: column,
      change: change
    }

    AppDispatcher.dispatch(action);
  }
}