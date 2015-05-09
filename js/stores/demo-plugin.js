import StoreBoilerplate from './store-boilerplate';
import Immutable from 'immutable';

class LocalDataPlugin extends StoreBoilerplate {
  constructor(){
    super();
  }

  get RegisteredCallbacks() {
    return {
      GRIDDLE_LOADED_DATA(action, state) {
        return state.set('data', new Immutable.List([
            {one: "one", two: "two"},
            {one: "three", two: "four"}
          ]
        )).set('somethingElse', 'test');
      }
    }
  }

  get PrePatches() {
    return;
  }

  get PostPatches() {
    return {
      GRIDDLE_LOADED_DATA(action, state) {
         return state.set('data', state.get('data').push({five: "five", six: "six"}));
      }
    }
  }

  get Helpers() {
    return {
      getStatee() {
        return this.state
          .set('data', new Immutable.List([
            {one: '1', two: '2'}
          ]));
      }
    }
  }
}

export default LocalDataPlugin;
