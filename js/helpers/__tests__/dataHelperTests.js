import Immutable from 'immutable';

import {
  getVisibleData,
  updateVisibleData,
  getState,
  getPageProperties,
  addKeyToRows,
  getPageCount,
  getColumnTitles,
  getColumnProperties,
  getAllPossibleColumns,
  getSortedColumns,
  getDataColumns
} from '../data-helpers';

import { getBasicState } from './stateUtils';

describe('data helpers', () => {
  describe('getVisibleData', () => {
    it('gets visible data', () => {
      const state = getBasicState();
      const results = getVisibleData(state);
      expect(results.toJSON()).toEqual([{two: 'two', one: 'one'}, {two: 'four', one: 'three'}]);
    });

    it('only gets data for visible columns', () => {
      const columnProperties = getBasicState().getIn(['renderProperties', 'columnProperties']).filterNot(col => col.get('id') === 'one');
      const state = getBasicState().setIn(['renderProperties', 'columnProperties'], columnProperties);
      const results = getVisibleData(state);

      expect(results.toJSON()).toEqual([{two: 'two'}, {two: 'four'}]);
    })
  });

  describe('updateVisibleData', () => {
    it('sets visible data', () => {
      const state = getBasicState();
      const nextState = updateVisibleData(state);

      expect(state.get('data').toJSON()).toEqual(nextState.get('visibleData').toJSON());
    });
  });

  describe('getState', () => {
    it('gets state', () => {
      const state = getBasicState();

      expect(getState(state)).toEqual(state);
    });
  });

  describe('getPageProperties', () => {
    it('gets page properties', () => {
      const state = getBasicState();

      expect(getPageProperties(state)).toEqual(state.get('pageProperties'));
    })
  });

  describe('addKeyToRows', () => {
    it('adds a key to all rows', () => {
      const state = getBasicState();
      const newData = addKeyToRows(state.get('data'));

      expect(newData.get(0).get('griddleKey')).toBeDefined();
    });
  });

  describe('getPageCount', () => {
    it('gets the correct number of pages', () => {
      expect(getPageCount(50, 5)).toEqual(10);
      expect(getPageCount(50, 6)).toEqual(9);
    });
  });

  describe('getColumnTitles', () => {
    it('gets the correct titles', () => {
      const state = getBasicState();
      const titles = getColumnTitles(state);

      expect(titles).toEqual({
        one: { one: 'One' },
        two: { two: 'Two' }
      });
    });
  });

  describe('getColumnProperties', () => {
    it('gets column properties', () => {
      const state = getBasicState();
      const properties = getColumnProperties(state);

      expect(properties).toEqual(state.getIn(['renderProperties', 'columnProperties']).toJSON())
    });

    it('returns empty object on state without columnProperties', () => {
      const state = Immutable.fromJS({
        renderProperties: {}
      });
      const properties = getColumnProperties(state);

      expect(properties).toEqual({});
    });
  });

  describe('getAllPossibleColumns', () => {
    it('gets as Seq containing keys from data', () => {
      const state = getBasicState();
      const possibleColumns = getAllPossibleColumns(state);

      expect(possibleColumns.toJSON()).toEqual(['one', 'two'])
    });
  });

  describe('getSortedColumns', () => {
    it('sorts the columns', () => {
      const state = getBasicState();
      const sorted = getSortedColumns(state.get('data'), ['two', 'one']);

      expect(sorted.toJSON()).toEqual([{two: 'two', one: 'one'}, {two: 'four', one: 'three'}]);
    });
  });

  describe('getDataColumns', () => {
    it('gets the columns arranged by order', () => {
      const state = getBasicState();
      const dataColumns = getDataColumns(state);

      expect(dataColumns).toEqual(['two', 'one']);
    });

    it('gets only the visible columns', () => {
      const columnProperties = getBasicState().getIn(['renderProperties', 'columnProperties']).filterNot(col => col.get('id') === 'one');
      const state = getBasicState().setIn(['renderProperties', 'columnProperties'], columnProperties);
      const dataColumns = getDataColumns(state);

      expect(dataColumns).toEqual(['two']);
    })
  });
});

