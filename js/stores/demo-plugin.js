import StoreBoilerplate from './store-boilerplate';
import Immutable from 'immutable';

var LocalDataPlugin = {

  registeredCallbacks: {
    GRIDDLE_LOADED_DATA(action, state) {
      return state.set('data', new Immutable.List([
          {one: "one", two: "two"},
          {one: "three", two: "four"}
        ]
      )).set('somethingElse', 'test');
    }
  },

  prePatches: {
  },

  postPatches: {
    GRIDDLE_LOADED_DATA(action, state) {
       return state.set('data', state.get('data').push({five: "five", six: "six"}));
    }
  },

  helpers: {
    getState() {
      return this.state
        .set('data', new Immutable.List([
          {one: '1', two: '2'}
        ]));
    }
  }
}

export default LocalDataPlugin;
