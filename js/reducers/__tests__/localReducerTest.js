import Immutable from 'immutable';
import * as Helpers from '../../helpers/local-helpers';
import LocalReducer, {
  GRIDDLE_LOADED_DATA,
  AFTER_REDUCE,
  GRIDDLE_SET_PAGE_SIZE,
  GRIDDLE_GET_PAGE,
  GRIDDLE_NEXT_PAGE,
  GRIDDLE_PREVIOUS_PAGE,
  GRIDDLE_FILTERED,
  GRIDDLE_SORT
} from '../local-reducer';

import extend from 'lodash.assign';

//TODO: Import the testHelpers instead of using this directly
const getMethod = (options) => {
  if(!options.method) {
    throw "Need a method to call"
  }

  const combined = extend({state: Immutable.fromJS({}), payload: {}, helpers: {}, method: null}, options);
  const { state, payload, helpers, method } = combined;
  return method.call(this, state, payload, helpers);
}

const defaultData = [
  {one: "one", two: "two", three: "three"},
  {one: "un", two: "du", three: "trois"},
  {one: "uno", two: "dos", three: "tres"},
  {one: "ichi", two: "ni", three: "san"},
];

describe('localDataReducer', () => {
  describe('load data', () => {
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
    const afterReduce = (options) => {
      return getMethod(extend(options, {method: AFTER_REDUCE}));
    }

    const defaultHelpers = extend(Helpers, {
      getDataSet: (state) => { return state; },
      getVisibleData: (state) => { return state; }
    });

    it('sets visible data', () => {
      const visibleData = [{ one: "one", two: "two", three: "three" }];
      const helpers = extend({}, defaultHelpers, {
        getVisibleData: (state) => { return visibleData; },
      });

      const state = afterReduce({ helpers });
      expect(state.get('visibleData')).toEqual(visibleData);
    });

    it('sets has next', () => {
      const helpers = extend({}, defaultHelpers, {
        hasNext: (state) => { return true; },
      });

      const state = afterReduce({ helpers });
      expect(state.get('hasNext')).toEqual(true);
    });

    it('sets has previous', () => {
      const helpers = extend({}, defaultHelpers, {
        hasPrevious: (state) => { return true; },
      });

      const state = afterReduce({ helpers });
      expect(state.get('hasPrevious')).toEqual(true);
    });

    it('sets max page', () => {
      const helpers = extend({}, defaultHelpers, {
        getPageCount: (state) => { return 3}
      });

      const state = afterReduce({ helpers });
      expect(state.getIn(['pageProperties', 'maxPage'])).toEqual(3);
    });
  });

  describe('set page size', () => {
    const setPageSize  = (options) => {
      return getMethod(extend(options, { method: GRIDDLE_SET_PAGE_SIZE }));
    }

    const defaultHelpers = extend(Helpers, {
      getPageCount: (state) => { return 3; }
    });


    it('sets the page size', () => {
      const state = setPageSize({ helpers: defaultHelpers,
        state: Immutable.fromJS({ data: defaultData }),
        payload: { pageSize: 10 }
      });

      expect(state.getIn(['pageProperties', 'maxPage'])).toEqual(3);
      expect(state.getIn(['pageProperties', 'pageSize'])).toEqual(10);
    });
  });

  describe('paging', () => {
    const reducer = (options, method) => {
      return getMethod(extend(options, { method }));
    }

    const defaultPage = [
      {one: 'one', two: 'two', three: 'three'},
      {one: 'uno', two: 'dos', three: 'tres'},
      {one: 'ichi', two: 'ni', three: 'san'}
    ];

    const defaultHelpers = extend(Helpers,
      { getPage: (state, pageNumber) => state.set('data', defaultPage[pageNumber]) });

    it('gets a page of data', () => {
      const state = reducer({ helpers: defaultHelpers,
        state: Immutable.fromJS({}),
        payload: { pageNumber: 2 }
      }, GRIDDLE_GET_PAGE);

      expect(state.get('data')).toEqual(defaultPage[2]);
    });

    it('gets next page', () => {
      const state = reducer({ helpers: defaultHelpers,
        state: Immutable.fromJS({ pageProperties: { currentPage: 0, maxPage: 2 } }),
      }, GRIDDLE_NEXT_PAGE);

      expect(state.get('data')).toEqual(defaultPage[1]);
    });

    it('gets last page when calling next page on last page', () => {
      const state = reducer({ helpers: defaultHelpers,
        state: Immutable.fromJS({ pageProperties: { currentPage: 2, maxPage: 2 } }),
      }, GRIDDLE_NEXT_PAGE);

      expect(state.get('data')).toEqual(defaultPage[2]);
    });

    it('gets previous page', () => {
      const state = reducer({ helpers: defaultHelpers,
        state: Immutable.fromJS({ pageProperties: { currentPage: 1 } }),
      }, GRIDDLE_PREVIOUS_PAGE);

      expect(state.get('data')).toEqual(defaultPage[0]);
    });

    it('gets first page when calling previous on first page', () => {
      const state = reducer({ helpers: defaultHelpers,
        state: Immutable.fromJS({ pageProperties: { currentPage: 0 } }),
      }, GRIDDLE_PREVIOUS_PAGE);

      expect(state.get('data')).toEqual(defaultPage[0]);
    });
  });

  describe('filtering', () => {
    const reducer = (options, method) => {
      return getMethod(extend(options, { method }));
    }

    it('sets the filter', () => {
      const state = reducer({ payload: { filter: 'test' }}, GRIDDLE_FILTERED);
      expect(state.get('filter')).toEqual('test');
    });

    it('sets the first page when filtering', () => {
      const state = reducer({ payload: { filter: 'test'}}, GRIDDLE_FILTERED);
      expect(state.getIn(['pageProperties', 'currentPage'])).toEqual(1);
    })
  });

  describe('sorting', () => {
    const reducer = (options, method) => {
      return getMethod(extend(options, { method }));
    }

    it('returns the state when no sort columns are present', () => {
      const state = reducer({}, GRIDDLE_SORT);

      expect(state.toJSON()).toEqual({});
    });

    it('calls sortByColumns when sort column present', () => {
      let count = 0;

      const helpers = extend(Helpers,
        { sortByColumns: (state, pageNumber) => count++ });
      const payload = { sortColumns: ['one'] };
      const state = reducer({ helpers, payload }, GRIDDLE_SORT)

      //the sortByColumns method should increment the count -- this is a cheezy shouldHaveBeenCalled
      expect(count).toEqual(1);
    });
  });
});
