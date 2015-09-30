import GriddleReducer, {
  combineAndOverrideReducers,
  getBeforeReducers,
  getAfterReducers,
  getReducersByWordEnding,
  wrapReducer,
  combineInitialState
} from '../griddle-reducer'

import Immutable from 'immutable';

const setup = () => {
  const first = {
    basic: function(state, action, helpers) { return 'first'; },
    greet: function(state, action, helpers) { return state.set("testGreeting", `${state.get('testGreeting')} and hello`); },
    sayGoodbye: function(state, action, helpers) { return state.set("testGreeting", `${state.get('testGreeting')} and goodbye`); },
    hi_BEFORE: function(state, action, helpers) { return state.set('testBefore', 'hello from first before')},
    hi_AFTER: function(state, action, helpers) { return state.set('testAfter', 'hello from first after')}
  };

  const second = {
    basic: function(state, action, helpers) { return 'second'; },
    greet: function(state, action, helpers) { return state.set("testGreeting", `Yo! ${state.get('testGreeting')}`); },
    sayGoodbye: function(state, action, helpers) { return state.set("testGreeting", `Later! ${state.get('testGreeting')}`); },
    helloGoodbye: function(state, action, helpers) { return state; },
    hi_BEFORE: function(state, action, helpers) { return state.set('testBefore', 'hello from second before')},
    hi_AFTER: function(state, action, helpers) { return state.set('testAfter', 'hello from second after')}

  };

  return { first, second };
};

describe('GriddleReducer', () => {
  describe('CombineAndOverrideReducers', () => {
     it('has the right methods', () => {
      const { first, second } = setup();
      const result = combineAndOverrideReducers([first, second]);
      const methods = Object.keys(result);
      expect(methods.indexOf('greet') >= 0).toBe(true);
      expect(methods.indexOf('sayGoodbye') >= 0).toBe(true);
    });

    it('overrides reducers in the correct order', () =>{
      const { first, second } = setup();
      const result = combineAndOverrideReducers([first, second]);

      expect(second.basic()).toEqual(result.basic());
    });
  });
  
  describe('getReducersByWordEnding', () => {
     it('Obtains reducers by word ending', () => {
      const { first, second } = setup();

      const reducers = getReducersByWordEnding([first, second], 'Goodbye');
      expect(reducers.helloGoodbye).toEqual(jasmine.anything());
      expect(reducers.sayGoodbye).toEqual(jasmine.anything());
      expect(reducers.greet).not.toEqual(jasmine.anything());
    });

    it('calls reducers in correct in the order they were defined by word ending', () => {
      const state = Immutable.Map().set("testGreeting", "Hi");
      const { first, second } = setup();
      const reducers = getReducersByWordEnding([first, second], 'Goodbye');

      var message = reducers.sayGoodbye(state, null, null);
      expect(message.get('testGreeting')).toEqual("Later! Hi and goodbye");
    });
  });

  describe('getBeforeReducers', () => {
    it('obtains before reducers', () => {
      const { first, second } = setup();
      const reducers = getBeforeReducers([first, second]);

      expect(reducers.hi_BEFORE).toEqual(jasmine.anything());
    });

    it('has a proper method as the result of getBeforeReducers', () => {
      const { first, second } = setup();
      const reducers = getBeforeReducers([first, second]);
      const reducers2 = getBeforeReducers([second, first]);

      const state = Immutable.Map().set("testGreeting", "Hi");

      expect(reducers.hi_BEFORE(state, null, null).toJSON().testBefore).toEqual('hello from second before');
      expect(reducers2.hi_BEFORE(state, null, null).toJSON().testBefore).toEqual('hello from first before');
    });
  });

  describe('getAfterReducers', () => {
     it('obtains after reducers', () => {
      const { first, second } = setup();
      const reducers = getAfterReducers([first, second]);

      expect(reducers.hi_AFTER).toEqual(jasmine.anything());
    });

    it('has a proper method as the result of getAfter', () => {
      const { first, second } = setup();
      const reducers = getAfterReducers([first, second]);
      const reducers2 = getAfterReducers([second, first]);

      const state = Immutable.Map().set("testGreeting", "Hi");

      expect(reducers.hi_AFTER(state, null, null).toJSON().testAfter).toEqual('hello from second after');
      expect(reducers2.hi_AFTER(state, null, null).toJSON().testAfter).toEqual('hello from first after');
    });
  });

  describe('wrapReducer', () => {
    it('passes the result of the previous function to the next', () => {
      const function1 = function function1(state, action, helpers) { return "hi"; }
      const function2 = function function2(state, action, helpers) { return state; }

      expect(wrapReducer(function2, function1)("something", null, null)).toEqual("hi");
    });

    it('returns just the "next" function if previous is not specified', () => {
      const function1 = function function1(state, action, helpers) { return "hi"; }
      const function2 = function function2(state, action, helpers) { return state; }

      expect(wrapReducer(function2)("something", null, null)).toEqual("something");
    });
  });

  describe('combineInitialState', () => {
    it('combines state', () => {
      var one = new Immutable.fromJS({ one: "first" });
      var two = new Immutable.fromJS({ two: "second" });
      var three = new Immutable.fromJS({ three: "third" });

      const states = combineInitialState([one, two, three]);
      expect(states.get('one')).toEqual('first');
      expect(states.get('two')).toEqual('second');
      expect(states.get('three')).toEqual('third');
    });
  })
});
