'use strict';

//clean these up
import * as types from '../constants/action-types';
import Immutable from 'immutable';
import MAX_SAFE_INTEGER from 'max-safe-integer';
import {registerReducer} from './griddle-reducer';

var initialState = Immutable.fromJS({
  data: [],
  pageProperties: {
    currentPage: 0,
    maxPage: 0,
    pageSize: 0
  }
});

/* HELPERS */
//TODO: These can possibly be wrapped up as middleware?
export const helpers = {
  getVisibleData(state = this.state) {
    const data =  state.get('data');
    return this.getDataColumns(state, data);
  },

  getState(state = this.state) {
    return state;
  },

  getPageProperties(state = this.state) {

    return state.get('pageProperties');
  },

  getColumnTitles(state = this.state) {
    if(state.get('renderProperties') && state.get('renderProperties').get('columnProperties').size !== 0) {
      return state
        .get('renderProperties')
        .get('columnProperties')
        .filter(column => !!column.get('displayName'))
        .map(column => {
          let col = {};
          col[column.get('id')] = column.get('displayName');
          return col;
        }).toJSON();
    }

    return {};
  },

  getColumnProperties(state = this.state) {
    if(state.get('renderProperties') && state.get('renderProperties').get('columnProperties').size !== 0) {
      return state
        .get('renderProperties')
        .get('columnProperties').toJSON();
    }

    return {};
  },

  getVisibleColumns(state = this.state) {
    if(this.state.get('data').size === 0) {
      return new Immutable.fromJS([]);
    }
  },

  getAllPossibleColumns(state = this.state) {
    if(this.state.get('data').size === 0) {
      return new Immutable.fromJS([]);
    }

    return this.state.get('data').get(0).keySeq();
  },

  //TODO: consider moving state after data so that we can assign state = this.state by default
  getDataColumns(state, data) {
    if(state.get('renderProperties') && state.get('renderProperties').get('columnProperties').size !== 0) {
      const keys = state
        .get('renderProperties')
        .get('columnProperties')
        .sortBy(col => col.get('order')||MAX_SAFE_INTEGER)
        .keySeq()
        .toJSON();

      return data
        .map(item => item
          .filter((val, key) => keys.indexOf(key) > -1 )
          .sortBy((val, key) => keys.indexOf(key))
        );
    }

    return data;
  }
}

export const handlers = {
  GRIDDLE_INITIALIZED: (state, action) => {},

  GRIDDLE_LOADED_DATA: (state, action) => {
    return state.set('data', Immutable.fromJS(action.data))
      .set('renderProperties', Immutable.fromJS(action.properties));
  },

  GRIDDLE_TOGGLE_COLUMN: (state, action) => {
    const toggleColumn = function(columnId, fromProperty, toProperty) {
      if(state.get('renderProperties').get(fromProperty) &&
        state.get('renderProperties').get(fromProperty).has(columnId)) {
          const columnValue = state.getIn(['renderProperties', fromProperty, columnId])

          return state
            .setIn(['renderProperties', toProperty, columnId], columnValue)
            .removeIn(['renderProperties', fromProperty, columnId]);
        }
    }
  }
}

export default registerReducer(initialState, handlers);


