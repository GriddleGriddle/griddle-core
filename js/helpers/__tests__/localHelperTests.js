import Immutable from 'immutable';

import {
  getVisibleData,
  hasNext,
  hasPrevious,
  getDataSet,
  filterData,
  getSortedData,
  sortByColumns,
  getPage
} from '../local-helpers';

import { getBasicState } from './stateUtils';

describe('localHelpers', () => {
  it('gets visible data', () => {
    const state = getBasicState();
    const visibleData = getVisibleData(state);

    expect(visibleData.size).toEqual(state.getIn(['pageProperties', 'pageSize']));
    expect(visibleData.toJSON()).toEqual([{two: 'two', one: 'one'}]);
  });

  describe('hasNext', () => {
    it('returns true when on first page and there are more results', () => {
      //this is currently one page and one result per page and there are two items
      const state = getBasicState();
      const hasMore  = hasNext(state);

      expect(hasMore).toEqual(true);
    });

    it('returns false when on the last page', () => {
      const state = getBasicState().setIn(['pageProperties', 'currentPage'], 2);
      const hasMore = hasNext(state);

      expect(hasMore).toEqual(false);
    });
  });

  describe('hasPrevious', () => {
    it('returns false when on first page', () => {
      const state = getBasicState();
      const localHasPrevious  = hasPrevious(state);

      expect(localHasPrevious).toEqual(false);
    });

    it('returns false when on the last page', () => {
      const state = getBasicState().setIn(['pageProperties', 'currentPage'], 2);
      const localHasPrevious  = hasPrevious(state);

      expect(localHasPrevious).toEqual(true);
    });
  });

  describe('getDataSet', () => {
    it('returns state if no filter present', () => {
      const state = getBasicState();
      const dataState = getDataSet(state);

      expect(state.get('data')).toEqual(dataState);
    });

    //TODO: Add test to make sure it calls filter method when there is a filter present
  });

  describe('filterData', () => {
    it('returns filtered data', () => {
      const state = getBasicState();
      const filteredData = filterData(state.get('data'), 'four');

      expect(filteredData.size).toEqual(1);
      expect(filteredData.toJSON()).toEqual([{one: 'three', two: 'four'}]);
    });

    it('returns the whole dataset when no filter is present', () => {
      const state = getBasicState();
      const filteredData = filterData(state.get('data'), '');

      expect(filteredData.size).toEqual(2);
      expect(filteredData.toJSON()).toEqual(state.get('data').toJSON());
    });
  });

  describe('getSortedData', () => {
    it('sorts the data', () => {
      const state = getBasicState();
      const sortedData = getSortedData(state.get('data'), ['two']);

      expect(sortedData.toJSON()).toEqual([{one: 'three', two: 'four'}, {one: 'one', two: 'two'}]);
    });

    it('sorts in reverse order when sortAscending = false', () => {
      const state = getBasicState();
      const sortedData = getSortedData(state.get('data'), ['one'], false);

      expect(sortedData.toJSON()).toEqual([{one: 'three', two: 'four'}, {one: 'one', two: 'two'}]);
    });
  });

  describe('sortByColumns', () => {
    it('sorts the data', () => {
      const state = getBasicState();
      const sortedByColumns = sortByColumns(state, ['two']);
      expect(sortedByColumns.get('data').toJSON()).toEqual([{one: 'three', two: 'four'}, {one: 'one', two: 'two'}]);
    });

    it('sorts in reverse order when sortAscending = false', () => {
      const state = getBasicState();
      const sortDescending = true;
      const sortedData = sortByColumns(state, ['one'], sortDescending);

      expect(sortedData.get('data').toJSON()).toEqual([{one: 'three', two: 'four'}, {one: 'one', two: 'two'}]);
    });
  });

  describe('getPage', () => {
    it('gets the specified page', () => {
      const state = getBasicState();
      const firstPage = getPage(state, 1);
      const secondPage = getPage(state, 2);
      const invalidPage = getPage(state, 5);

      expect(firstPage.getIn(['pageProperties', 'currentPage'])).toEqual(1);
      expect(firstPage.getIn(['pageProperties', 'maxPage'])).toEqual(2);

      expect(secondPage.getIn(['pageProperties', 'currentPage'])).toEqual(2);
      expect(secondPage.getIn(['pageProperties', 'maxPage'])).toEqual(2);

      expect(invalidPage.getIn(['pageProperties', 'currentPage'])).toEqual(0);
      expect(invalidPage.getIn(['pageProperties', 'maxPage'])).toEqual(2);
    });
  })
});

