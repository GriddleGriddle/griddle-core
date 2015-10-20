import Immutable from 'immutable';

import { getMethod, getReducer } from './testUtils';
import extend from 'lodash.assign';

import {
  GRIDDLE_LOADED_DATA_AFTER,
  GRIDDLE_ROW_TOGGLED,
  AFTER_REDUCE
} from '../subgrid-reducer';

const defaultData = [
  {
    one: "one",
    two: "two",
    three: "three",
    griddleKey: 1,
    children: [
      {one: "un", two: "du", three: "trois", griddleKey: 10 },
      {one: "uno", two: "dos", three: "tres", griddleKey: 11 },
      {one: "ichi", two: "ni", three: "san", griddleKey: 12 },
    ]
  },
  {
    one: "un",
    two: "du",
    three: "trois",
    griddleKey: 2,
    children: [
      {one: "un", two: "du", three: "trois", griddleKey: 20 },
      {one: "uno", two: "dos", three: "tres", griddleKey: 21 },
      {one: "ichi", two: "ni", three: "san", griddleKey: 22 },
    ]
  },
  {
    one: "uno",
    two: "dos",
    three: "tres",
    griddleKey: 3,
    children: [
      {one: "un", two: "du", three: "trois", griddleKey: 30 },
      {one: "uno", two: "dos", three: "tres", griddleKey: 31 },
      {one: "ichi", two: "ni", three: "san", griddleKey: 32 },
    ]
  }
];

describe('SubgridReducer', () => {
  it('sets initial properties on load_data', () => {
    const state = getReducer({
      state: Immutable.fromJS({ data: defaultData }),
      helpers: {
        getDataColumns: (state, data) => { columns: ['one', 'two', 'three', 'children']},
        getSortedData: (state) => state.get('data')
      }
    }, GRIDDLE_LOADED_DATA_AFTER)

    const firstRow = state.get('data').get(0).toJSON();
    expect(firstRow.hasOwnProperty('expanded')).toEqual(true);
    expect(firstRow.hasOwnProperty('depth')).toEqual(true);
    expect(firstRow.hasOwnProperty('parentId')).toEqual(true);
    expect(firstRow.hasOwnProperty('hasChildren')).toEqual(true);
  });

  //TODO: This is not really a valid test
  it('sets visible data after reducing', () => {
     let calledSort = false;

     const state = getReducer({
      state: Immutable.fromJS({ data: defaultData, visibleData: defaultData }),
      helpers: {
        getDataColumns: (state, data) => ['one', 'two', 'three', 'children'],
        getSortedColumns: (data, columns) => data,
        getSortedData: (state) =>{ calledSort = true; return state.get('data') }
      }
    }, AFTER_REDUCE)
    
    expect(state.get('visibleData').toJSON()).toEqual(defaultData);
  });

  it('expands row', () => {
      const state = getReducer({
      state: Immutable.fromJS({ data: defaultData, visibleData: defaultData }),
      helpers: {
        getDataColumns: (state, data) => ['one', 'two', 'three', 'children']
      },
      payload: { griddleKey: 1 }
    }, GRIDDLE_ROW_TOGGLED)
    
    expect(state.get('data').get(0).get('expanded')).toEqual(true);
  });

  it('collapses expanded row', () => {
      const getDataColumns = (state, data) => ['one', 'two', 'three', 'children'];
      const state = getReducer({
      state: Immutable.fromJS({ data: defaultData, visibleData: defaultData }),
      helpers: { getDataColumns },
      payload: { griddleKey: 1 }
    }, GRIDDLE_ROW_TOGGLED)
    
      const state2 = getReducer({
      state,
      helpers: { getDataColumns },
      payload: { griddleKey: 1 }
    }, GRIDDLE_ROW_TOGGLED)

    expect(state.get('data').get(0).get('expanded')).toEqual(true);
    expect(state2.get('data').get(0).get('expanded')).toEqual(false);
  });
});

