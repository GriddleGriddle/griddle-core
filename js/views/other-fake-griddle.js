"use strict";

import React from 'react';
import Immutable from 'immutable';
import _ from 'lodash';
import Flux from 'flux';
import LocalActions from '../actions/local-action-creators';
import DataStore from '../stores/data-store';
import LocalDataPlugin from '../stores/local-data-plugin';

class FakeGriddle extends React.Component {
  constructor(props){
    super(props);

    this.dispatcher = new Flux.Dispatcher();
    this.dataStore = new DataStore(this.dispatcher, []);
    this.localActions = new LocalActions(this.dispatcher);

    this.state = {};
    this.state.dataState = this.dataStore.getState();

    this.dataStore.addChangeListener(this.dataChange.bind(this));
  }

  componentDidMount() {
    if (this.props.data){
      this.localActions.loadData(this.props.data);
    }
  }

  dataChange() {
    this.setState({dataState: this.dataStore.getState()});
  }

  render() {
    const data = this.state.dataState.get('data').toJSON();
    debugger;
    if(data.length === 0) { return <h1>NOTHING!</h1>}

    var rows =
      _.map(data, (item) => {
        return <tr>
          {_.map(_.keys(item), function(key){
            return <td>{item[key]}</td>
          })}
        </tr>
      });

    return (
      <table>
        {rows}
      </table>);
  }
}

export default FakeGriddle;
