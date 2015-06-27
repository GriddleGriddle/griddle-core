var AppDipatcher = require('../dispatcher/app-dispatcher');
var Constants = require('../constants/constants');

class LocalActions {
  constructor(dispatcher){
    this.dispatcher = dispatcher;
  }

  initializeGrid(){
    this.dispatcher.dispatch({actionType: Constants.GRIDDLE_INITIALIZED});
  }

  removeGrid(){
    this.dispatcher.dispatch({actionType: Constants.GRIDDLE_REMOVED});
  }

  loadData(data, properties){
    var action = {
      actionType: Constants.GRIDDLE_LOADED_DATA,
      data,
      properties
    }

    this.dispatcher.dispatch(action);
  }

  filterData(filter){
    var action = {
      actionType: Constants.GRIDDLE_FILTERED,
      filter: filter
    };

    this.dispatcher.dispatch(action);
  }

  setPageSize(pageSize){
    var action = {
      actionType: Constants.GRIDDLE_SET_PAGE_SIZE,
      pageSize: pageSize
    }

    this.dispatcher.dispatch(action);
  }

  sort(column){
    var action = {
      actionType: Constants.GRIDDLE_SORT,
      sortColumns: [column]
    };

    this.dispatcher.dispatch(action);
  }

  addSortColumn(column){
    var action = {
      actionType: Constants.GRIDDLE_ADD_SORT_COLUMN,
      sortColumn: column
    }

    this.dispatcher.dispatch(action);
  }

  loadNext(){
    var action = {
      actionType: Constants.GRIDDLE_NEXT_PAGE
    };

    this.dispatcher.dispatch(action);
  }

  loadPrevious(){
    var action = {
      actionType: Constants.GRIDDLE_PREVIOUS_PAGE
    };

    this.dispatcher.dispatch(action);
  }

  loadPage(number){
    var action = {
      actionType: Constants.GRIDDLE_GET_PAGE,
      pageNumber: number
    }

    this.dispatcher.dispatch(action);
  }

  resizeColumn(column, change) {
    var action = {
      gridId: gridId,
      actionType: Constants.COLUMN_RESIZE,
      column: column,
      change: change
    }

    this.dispatcher.dispatch(action);
  }

  setScrollPosition(xScrollPosition, xScrollMax, yScrollPosition, yScrollMax) {
    var action = {
      actionType: Constants.XY_POSITION_CHANGED,
      xScrollPosition: xScrollPosition,
      xScrollMax: xScrollMax,
      yScrollPosition: yScrollPosition,
      yScrollMax: yScrollMax
    };

    this.dispatcher.dispatch(action);
  }

  toggleColumn(columnId) {
    var action = {
      actionType: Constants.GRIDDLE_TOGGLE_COLUMN,
      columnId: columnId
    };

    this.dispatcher.dispatch(action);
  }
}

export default LocalActions;
