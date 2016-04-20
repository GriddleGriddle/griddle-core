import Immutable from 'immutable';
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

const initialState = {
  renderProperties: {columnProperties: null},
  sortDirections: [],
  sortColumns: []
};

//TODO: Import the testHelpers instead of using this directly
const getMethod = (options) => {
  if(!options.method) {
    throw "Need a method to call"
  }

  const combined = extend({state: Immutable.fromJS(initialState), payload: {}, method: null}, options);
  const { state, payload, method } = combined;
  return method.call(this, state, payload);
}

const defaultData = [
  {one: "one", two: "two", three: "three"},
  {one: "un", two: "du", three: "trois"},
  {one: "uno", two: "dos", three: "tres"},
  {one: "ichi", two: "ni", three: "san"},
];

const withDefaultKeys = (data) => data.toJSON().map(row => ({ one: row["one"], two: row["two"], three: row["three"]}))


describe('localDataReducer', () => {
  describe('load data', () => {
    const loadData = (options) => {
      return getMethod(extend(options, {method: GRIDDLE_LOADED_DATA}));
    }

    it('sets the data', () => {
      const state = loadData({ payload: { data: defaultData }});

      expect(withDefaultKeys(state.get('data'))).toEqual(defaultData);
    });

    it('sets all columns', () => {
      const state = loadData({ payload: { data: defaultData }});
      expect(state.get('allColumns')).toEqual(['one', 'two', 'three'])
    });
  });

  describe('after reduce', () => {
    const afterReduce = (options) => {
      return getMethod(extend(options, {method: AFTER_REDUCE}));
    }
  });

  describe('set page size', () => {
    const setPageSize  = (options) => {
      return getMethod(extend(options, { method: GRIDDLE_SET_PAGE_SIZE }));
    }

    it('sets the page size', () => {
      const state = setPageSize({
        state: Immutable.fromJS({ data: defaultData }),
        payload: { pageSize: 10 }
      });

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

    it('gets a page of data', () => {
      const state = reducer({
        state: Immutable.fromJS({}),
        payload: { pageNumber: 2 }
      }, GRIDDLE_GET_PAGE);

      expect(state.getIn(['pageProperties', 'currentPage'])).toEqual(2);
    });

    it('gets next page', () => {
      const state = reducer({
        state: Immutable.fromJS({ pageProperties: { currentPage: 0, maxPage: 2 } }),
      }, GRIDDLE_NEXT_PAGE);

      expect(state.getIn(['pageProperties', 'currentPage'])).toEqual(1);
    });

    it('gets last page when calling next page on last page', () => {
      const state = reducer({
        state: Immutable.fromJS({ pageProperties: { currentPage: 2, maxPage: 2 } }),
      }, GRIDDLE_NEXT_PAGE);

      expect(state.getIn(['pageProperties', 'currentPage'])).toEqual(2);
    });

    it('gets previous page', () => {
      const state = reducer({
        state: Immutable.fromJS({ pageProperties: { currentPage: 1 } }),
      }, GRIDDLE_PREVIOUS_PAGE);

      expect(state.getIn(['pageProperties', 'currentPage'])).toEqual(0);
    });

    it('gets first page when calling previous on first page', () => {
      const state = reducer({
        state: Immutable.fromJS({ pageProperties: { currentPage: 0 } }),
      }, GRIDDLE_PREVIOUS_PAGE);

      expect(state.getIn(['pageProperties', 'currentPage'])).toEqual(0);
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

    it('sets sort column', () => {
      const state = reducer({payload: { sortColumns: ['one']}}, GRIDDLE_SORT);

      expect(state.get('sortColumns')).toEqual(['one']);
    });
  });
});
