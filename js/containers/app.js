import React, { Component } from 'react';
import GriddleContainer from './griddle-container';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import * as reducers from '../reducers';
import * as states from '../initialStates';
import * as HelperContainer from '../helpers';
import GriddleReducer from '../reducers/griddle-reducer';

const griddleReducer = {griddle: GriddleReducer([states.data, states.local, states.position], [reducers.data, reducers.local, reducers.position], [HelperContainer.data, HelperContainer.local, HelperContainer.position])};
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