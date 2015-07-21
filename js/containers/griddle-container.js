import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Griddle from '../views/other-fake-griddle';
import * as GriddleActions from '../actions/local-actions';

@connect(state => {
  return ({
  state: state
})})
export default class GriddleContainer extends Component {
  render() {
    const { state, dispatch } = this.props;
    debugger;
    return (
      <Griddle griddle={state.griddle}
        {...bindActionCreators(GriddleActions, dispatch)} />
    );
  }
}