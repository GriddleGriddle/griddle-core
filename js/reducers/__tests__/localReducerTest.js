import Immutable from 'immutable';
import * as Helpers from '../../helpers/local-helpers';
import LocalReducer, {
  GRIDDLE_LOADED_DATA
} from '../local-reducer';

import extend from 'lodash.assign';

describe('load data', () => {
  const defaultData = [
    {one: "one", two: "two", three: "three"},
    {one: "un", two: "du", three: "trois"},
    {one: "uno", two: "dos", three: "tres"},
    {one: "ichi", two: "ni", three: "san"},
  ];

  const getMethod = (options) => {
    if(!options.method) {
      throw "Need a method to call"
    }

    const combined = extend({state: Immutable.fromJS({}), payload: {}, helpers: {}, method: null}, options);
    const { state, payload, helpers, method } = combined;
    return method.call(this, state, payload, helpers);
  }

  const loadData = (options) => {
    return getMethod(extend(options, {method: GRIDDLE_LOADED_DATA}));
  }

  it('sets the data', () => {
    const helpers = extend(Helpers, { addKeyToRows:  (state) => {return state} });
    const state = loadData({ helpers, payload: { data: defaultData }});

    expect(state.get('data').toJSON()).toEqual(defaultData);
  });

  it('sets all columns', () => {
    const helpers = extend(Helpers, { addKeyToRows:  (state) => {return state} });
    const state = loadData({ helpers, payload: { data: defaultData }});
    expect(state.get('allColumns')).toEqual(['one', 'two', 'three'])
  });

  it('sets the properties', () => {
    const renderProperties = {property1: "one", property2: "two"};

    const helpers = extend(Helpers, { addKeyToRows:  (state) => {return state} });
    const state = loadData({ helpers, payload: { data: defaultData, properties: renderProperties }});

    expect(state.get('renderProperties').toJSON()).toEqual(renderProperties)
  });

  it('sets max page', () => {
    const helpers = extend(Helpers, {
      addKeyToRows: (state) => {return state},
      getPageCount: (state) => { return 3}
    });

    const state = loadData({ helpers, payload: { data: defaultData }});

    expect(state.getIn(['pageProperties', 'maxPage'])).toEqual(3);
  });
});

describe('after reduce', () => {
  it('sets visible data', () => {
    
  })
});
