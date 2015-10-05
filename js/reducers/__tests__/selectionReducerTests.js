import Immutable from 'immutable';
import {
  GRIDDLE_ROW_SELECTION_TOGGLED,
} from '../selectionReducer';

import extend from 'lodash.assign';

import { getMethod, getReducer } from './testUtils';

describe('Selection reducer', () => {
  it('selects a row when not currently selected', () => {
    const defaultData = [
      {one: "one", two: "two", three: "three", griddleKey: 1 },
      {one: "un", two: "du", three: "trois", griddleKey: 2 },
      {one: "uno", two: "dos", three: "tres", griddleKey: 3 },
      {one: "ichi", two: "ni", three: "san", griddleKey: 4, selected: false},
    ];

    const state = getReducer({
      state: Immutable.fromJS({ data: defaultData }),
      payload: { griddleKey: 3 },
      helpers: {
        getDataColumns: () => ['one', 'two', 'three']
      }
    }, GRIDDLE_ROW_SELECTION_TOGGLED);

    expect(state.get('data').get(2).get('selected')).toEqual(true);
  });

  it('un-selects a row when currently selected', () => {
    const defaultData = [
      {one: "one", two: "two", three: "three", griddleKey: 1 },
      {one: "un", two: "du", three: "trois", griddleKey: 2 },
      {one: "uno", two: "dos", three: "tres", griddleKey: 3, selected: true },
      {one: "ichi", two: "ni", three: "san", griddleKey: 4 },
    ];

    const state = getReducer({
      state: Immutable.fromJS({ data: defaultData }),
      payload: { griddleKey: 3 },
      helpers: {
        getDataColumns: () => ['one', 'two', 'three']
      }
    }, GRIDDLE_ROW_SELECTION_TOGGLED);

    expect(state.get('data').get(2).get('selected')).toEqual(false);
  });
});
