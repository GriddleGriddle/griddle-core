import React, { Component } from 'react';
import GriddleContainer from './griddle-container';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import * as reducers from '../reducers';

const reducer = combineReducers(reducers);
const store = createStore(reducer);

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        {() => <GriddleContainer />}
      </Provider>
    );
  }
}