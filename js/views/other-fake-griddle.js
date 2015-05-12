"use strict";

import React from 'react';
import Immutable from 'immutable';
import _ from 'lodash';
import Flux from 'flux';
import LocalActions from '../actions/local-action-creators';
import DataStore from '../stores/data-store';
import LocalDataPlugin from '../stores/local-data-plugin';


class SortButton extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();

    this.props.action.sort(this.props.column);
  }

  render() {
    return (
      <button onClick={this.handleClick}>{this.props.column}</button>
    )
  }
}

class FakeGriddle extends React.Component {
  constructor(props){
    super(props);

    this.dispatcher = new Flux.Dispatcher();
    this.dataStore = new DataStore(this.dispatcher, [LocalDataPlugin]);
    this.localActions = new LocalActions(this.dispatcher);

    this.state = {};
    this.state.data = this.dataStore.getVisibleData();
    this.state.hasNext = false;
    this.state.hasPrevious = false;
    //TODO: look into autobinding plugins
    this.dataStore.addChangeListener(this.dataChange.bind(this));
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
  }

  componentDidMount() {
    if (this.props.data){
      this.localActions.loadData(this.props.data);
    }
  }

  handlePrevious() {
    this.localActions.loadPrevious();
  }

  handleNext() {
    this.localActions.loadNext();
  }

  handleFilter(e) {
    this.localActions.filterData(e.target.value);
  }

  dataChange() {
    this.setState({
      data: this.dataStore.getVisibleData(),
      hasNext: this.dataStore.hasNext(),
      hasPrevious: this.dataStore.hasPrevious()
    });
  }

  render() {
    const data = this.state.data.toJSON();
    if(data.length === 0) {
      return (<h1>NOTHING!</h1>);
    }

    var rows =
      _.map(data, (item) => {
        return <tr>
          {_.map(_.keys(item), function(key){
            return <td>{item[key]}</td>
          })}
        </tr>
      });


    var actionCreator = this.localActions;
    var keys = data.length > 0 ? Object.keys(data[0]) : null;
    var thead = !!keys ?
        <thead>
          {_.map(keys, function(key) {
            return (
              <th>
                <SortButton column={key} action={actionCreator} />
              </th>);
          })}

        </thead>
      : null;
    return (
      <div>
        <input type='text' placeholder='filter' onChange={this.handleFilter} />
        <table>
          {thead}
          <tbody>
            {rows}
          </tbody>
        </table>
        { this.state.hasPrevious ? <button onClick={this.handlePrevious}>PREVIOUS</button> : null }
        { this.state.hasNext ? <button onClick={this.handleNext}>NEXT</button> : null }
      </div>);
  }
}

export default FakeGriddle;
