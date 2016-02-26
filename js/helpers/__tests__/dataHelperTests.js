import Immutable from 'immutable';

import {
  getVisibleData,
  getVisibleDataColumns,
  updateVisibleData,
  getState,
  getPageProperties,
  addKeyToRows,
  getPageCount,
  getColumnTitles,
  getColumnProperties,
  getAllPossibleColumns,
  getDataColumns
} from '../data-helpers';

import { getBasicState } from './stateUtils';

const withoutMetadata = (item) => {
  delete item["__metadata"];
  return item;
}

describe('data helpers', () => {
  describe('getVisibleData', () => {
    it('gets visible data', () => {
      const state = getBasicState();
      const results = getVisibleData(state);
      expect(results.toJSON().map(withoutMetadata)).toEqual([{two: 'two', one: 'one'}, {two: 'four', one: 'three'}]);
    });

    it('only gets data for visible columns', () => {
      const columnProperties = getBasicState().getIn(['renderProperties', 'columnProperties']).filterNot(col => col.get('id') === 'one');
      const state = getBasicState().setIn(['renderProperties', 'columnProperties'], columnProperties);
      const results = getVisibleData(state);

      expect(results.toJSON().map(withoutMetadata)).toEqual([{two: 'two'}, {two: 'four'}]);
    })

    it('gets the index', () => {
      const columnProperties = getBasicState().getIn(['renderProperties', 'columnProperties']).filterNot(col => col.get('id') === 'one');
      const state = getBasicState().setIn(['renderProperties', 'columnProperties'], columnProperties);
      const results = getVisibleData(state);

      expect(results.toJSON().every((r, i) => r.__metadata.index === i)).toEqual(true)
    });
  });

  describe('getVisibleDataColumns', () => {
    it('gets data for the given columns', () => {
      const state = getBasicState();
      const results = getVisibleDataColumns(state.get('data'), ['one', 'two']);

      expect(results.toJSON().map(withoutMetadata)).toEqual([{two: 'two', one: 'one'}, {two: 'four', one: 'three'}]);
    });

    it('sorts the columns', () => {
      const state = getBasicState();
      const sorted = getVisibleDataColumns(state.get('data'), ['two', 'one']);

      expect(Object.keys(sorted.toJSON()[0])).toEqual(['two', 'one', '__metadata']);
    });

    //test for the columns that are made up from thin air
    it('gets null for magic column', () => {
      const state = getBasicState();
      const results = getVisibleDataColumns(state.get('data'), ['one', 'onepointfive', 'two']);

      expect(results.toJSON().map(withoutMetadata)).toEqual([{two: 'two', onepointfive: null,  one: 'one'}, {two: 'four', onepointfive: null,  one: 'three'}]);
    });

    it('gets correct order for magic column', () => {
      const state = getBasicState();
      const results = getVisibleDataColumns(state.get('data'), ['one', 'onepointfive', 'two']);

      expect(Object.keys(results.toJSON()[0])).toEqual(['one', 'onepointfive', 'two', '__metadata']);
    });
  })

  describe('updateVisibleData', () => {
    it('sets visible data', () => {
      const state = getBasicState();
      const nextState = updateVisibleData(state);

      expect(state.get('data').toJSON().map(withoutMetadata)).toEqual(nextState.get('visibleData').toJSON().map(withoutMetadata));
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
    });

    it('gets all columns if visible columns is empty', () => {
      const columnProperties = getBasicState().getIn(['renderProperties', 'columnProperties']).filterNot(col => (col.get('id') === 'one' || col.get('id') === 'two'));
      const state = getBasicState().setIn(['renderProperties', 'columnProperties'], columnProperties);
      const dataColumns = getDataColumns(state);

      //this needs to be one, two because it's not checking the order property
      expect(dataColumns).toEqual(['one', 'two']);
    })
  });
});

