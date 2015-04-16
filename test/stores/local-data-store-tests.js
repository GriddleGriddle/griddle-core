var DataStore = require('../../js/stores/local-data-store');
var AppDispatcher = require('../../js/dispatcher/app-dispatcher');
var Constants = require('../../js/constants/constants');
var _ = require('lodash');
var ScrollStore = require('../../js/stores/scroll-store');
var rewire = require('rewire');

describe("LocalDataStore", function(){
  it('does something', function(){
    expect('one').toEqual('one');
  });
})