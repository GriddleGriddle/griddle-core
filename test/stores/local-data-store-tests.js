var DataStore = require('../../js/stores/local-data-store');
var AppDispatcher = require('../../js/dispatcher/app-dispatcher');
var Constants = require('../../js/constants/constants');
var _ = require('lodash');
var rewire = require('rewire');

describe("LocalDataStore", function() {
  beforeEach(function(){
    this.LocalDataStore = rewire('../../js/stores/local-data-store');
    this.registeredCallback = this.LocalDataStore.__get__("registeredCallback");
  });

  it('sets the state to the initial grid properties on initialize', function(){
    this.registeredCallback({
        actionType: Constants.GRIDDLE_INITIALIZED,
        gridId: "test"
    });

    expect(this.LocalDataStore.getState("test")).toEqual({
      hasFilter:false,
      hasSort:false,
      data:[],
      visibleData:[],
      currentDataPage:[],
      pageProperties:{
        currentPage:0,
        maxPage:0,
        pageSize:5,
        initialDisplayIndex:0,
        lastDisplayIndex:0,
        infiniteScroll:false
      },
      sortProperties: {
        sortColumns:[],
        sortAscending:true,
        defaultSortAscending:true
      },
      scrollProperties: {
        xScrollPosition:0,
        yScrollPosition:0,
        tableHeight:400,
        tableWidth:900,
        rowHeight:25
      }
    });
  });

  it('removes grid state when deleted id is removed', function() {
    this.registeredCallback({
      actionType: Constants.GRIDDLE_INITIALIZED,
      gridId: "test"
    });

    expect(this.LocalDataStore.getState("test")).toBeDefined();

    this.registeredCallback({
      actionType: Constants.GRIDDLE_REMOVED,
      gridId: "test"
    });

    expect(this.LocalDataStore.getState("test")).not.toBeDefined();
  });
})