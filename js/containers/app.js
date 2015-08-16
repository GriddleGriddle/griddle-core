import React, { Component } from 'react';
import GriddleContainer from './griddle-container';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import * as reducers from '../reducers';
import * as states from '../initialStates/index';
import GriddleReducer from '../reducers/griddle-reducer';

const griddleReducer = {griddle: GriddleReducer([states.data, states.local], [reducers.data, reducers.local])};
const combinedReducer = combineReducers(griddleReducer);
const store = createStore(combinedReducer);

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        {() => <GriddleContainer />}
      </Provider>
    );
  }
}