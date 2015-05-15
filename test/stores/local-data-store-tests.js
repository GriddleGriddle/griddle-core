var Immutable = require('immutable');
var LocalDataPlugin = require('../../js/stores/local-data-plugin');
var AppDispatcher = require('../../js/dispatcher/app-dispatcher');
var Constants = require('../../js/constants/constants');

describe("LocalDataStore", function() {
  var state;

  beforeEach(function() {
    state = new Immutable.fromJS({});
  });

  it('initializes the state object with the expected properties', function() {
    state = LocalDataPlugin.initializeState(state);

    expect(state.getIn(['pageProperties', 'pageSize'])).toEqual(10);
    expect(state.getIn(['pageProperties', 'currentPage'])).toEqual(1);

    //TODO: This seems like a really bad way to test. Make it better
    expect(JSON.stringify(state.getIn(['sortProperties', 'sortColumns']))).toEqual('[]');
    expect(JSON.stringify(state.get('filteredData').toJS())).toEqual('[]');

    expect(state.getIn(['sortProperties', 'sortAscending'])).toEqual(true);
    expect(state.get('filter')).toEqual('');
  });

  it('sets the data on GRIDDLE_LODADED_DATA and data is valid', function() {
    var action = {data: ['one', 'two', 'three']}

    spyOn(LocalDataPlugin, 'getPageCount');
    state = LocalDataPlugin.registeredCallbacks.GRIDDLE_LOADED_DATA(action, state);

    expect(state.get('data').toJS()).toEqual(['one', 'two', 'three']);
    expect(LocalDataPlugin.getPageCount).toHaveBeenCalled();
  })
})
