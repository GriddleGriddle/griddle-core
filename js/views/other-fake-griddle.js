import React from 'react';
import fake from '../fake/fake-data.js';

export default class Griddle extends React.Component {
  componentDidMount() {
    this.props.loadData(fake);
  }
  render() {
    return (<h1>Hi!</h1>);
  }
}