import Immutable from 'immutable';
import { getMethod, getReducer } from './testUtils';
import extend from 'lodash.assign';

import {
  GRIDDLE_LOADED_DATA,
  GRIDDLE_TOGGLE_COLUMN
} from '../data-reducer';

const defaultData = [
  {one: "one", two: "two", three: "three", griddleKey: 1 },
  {one: "un", two: "du", three: "trois", griddleKey: 2 },
  {one: "uno", two: "dos", three: "tres", griddleKey: 3, selected: true },
  {one: "ichi", two: "ni", three: "san", griddleKey: 4 },
];

describe('DataReducer', () => {
  describe('GRIDDLE_LOADED_DATA', () => {
    const state = getReducer({
      payload: { data: defaultData, properties: { property1: "one" } },
      helpers: {
        addKeyToRows: (data) => Immutable.fromJS(data)
      }
    }, GRIDDLE_LOADED_DATA);

    it('runs addKeyToRows', () => {
      //if data is immutable, it called the addKeyToRows method here
      expect(state.get('data').toJSON()).toEqual(defaultData)
    });

    it('set the render properties', () => {
      expect(state.get('renderProperties').toJSON()).toEqual({ property1: "one" });
    });
  });

  describe('GRIDDLE_TOGGLE_COLUMN', () => {
    const props = {
      state: Immutable.fromJS({
        data: defaultData,
        renderProperties: {
          hiddenColumnProperties: {two: 'two'} ,
          columnProperties: { one: 'one', three: 'three' }
        }
      }),
      helpers: {
        addKeyToRows: (data) => Immutable.fromJS(data),
        updateVisibleData: (data) => Immutable.fromJS(data)
      },
      payload: {
        columnId: 'two'
      }
    };

    const runReducer = (properties) => {
      return getReducer(properties, GRIDDLE_TOGGLE_COLUMN);
    }

    it('toggles a column when not currently selected', () => {
      const state = runReducer(props);
      expect(state.getIn(['renderProperties', 'hiddenColumnProperties']).toJSON().hasOwnProperty('two')).toEqual(false);
    });

    it('toggles a column when not currently selected', () => {
      const state = runReducer(extend({}, props, { payload: { columnId: 'three' }}));
      expect(state.getIn(['renderProperties', 'hiddenColumnProperties']).toJSON().hasOwnProperty('three')).toEqual(true);
    });
  });
});

