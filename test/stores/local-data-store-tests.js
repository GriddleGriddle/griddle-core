var DataStore = require('../../js/stores/local-data-store');
var AppDispatcher = require('../../js/dispatcher/app-dispatcher');
var Constants = require('../../js/constants/constants');
var _ = require('lodash');
var rewire = require('rewire');
var ScrollStore = rewire('../../js/stores/scroll-store');
ScrollStore.dispatchToken = "hi";

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

    var state = this.LocalDataStore.getState('test');

    expect(state.hasFilter).toEqual(false);
    expect(state.hasSort).toEqual(false);
    expect(state.data).toEqual([]);
    expect(state.visibleData).toEqual([]);
    expect(state.currentDataPage).toEqual([]);
    expect(state.pageProperties).toEqual({ currentPage: 0, maxPage: 0, pageSize: 5, initialDisplayIndex: 0, lastDisplayIndex: 0, infiniteScroll: false });
    expect(state.sortProperties).toEqual({ sortColumns: [], sortAscending: true, defaultSortAscending: true });
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
