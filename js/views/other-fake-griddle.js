import React from 'react';
import fake from '../fake/fake-data.js';

export default class Griddle extends React.Component {
  componentDidMount() {
    debugger;
    this.props.loadData(fake);
  }
  render() {
    debugger;
    return (<h1>Hi!</h1>);
  }
}