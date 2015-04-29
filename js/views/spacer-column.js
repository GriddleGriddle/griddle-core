var React = require('react');
var DataStore = require('../stores/local-data-store');
var ScrollStore = require('../stores/scroll-store');
var LocalActions = require('../actions/local-action-creators');
var ScrollActions = require('../actions/scroll-action-creators');
var _ = require('lodash');

function getStateFromStore(gridId){
  var columnProperties = DataStore.getColumnProperties(gridId);

  return {
    columnWidth: ScrollStore.getColumnWidth(gridId),
    initialDisplayIndex: columnProperties.initialDisplayIndex, 
    lastDisplayIndex: columnProperties.lastDisplayIndex,
    maxColumnLength: columnProperties.maxColumnLength
  };
}

module.exports = React.createClass({
  getDefaultProps: function() {
    return{
      "position": "left",
      "header": false
    };
  },
  render: function(){
    var width = 0, spacerColumnStyle = {};

    // Get the length of columns that the spacer column will represent.
    var spacerColumnCount = this.props.position === "left" ? this.state.initialDisplayIndex :
      this.state.maxColumnLength - this.state.lastDisplayIndex;

    // Get the width in pixels.
    width = this.state.columnWidth * spacerColumnCount;
    spacerColumnStyle.width = width + "px";


    return this.props.header ? (<th key={this.props.position + '-' + width} style={spacerColumnStyle}></th>) : (
      <td key={this.props.position + '-' + width} style={spacerColumnStyle}></td>
    );
  },
  getInitialState: function(){
    return getStateFromStore(this.props.gridId);
  },
  dataChange: function(){
    var newState = getStateFromStore(this.props.gridId);
    if (newState.maxColumnLength !== this.state.maxColumnLength ||
        newState.initialDisplayIndex !== this.state.initialDisplayIndex ||
        newState.lastDisplayIndex !== this.state.lastDisplayIndex) {
      this.setState(newState);
    }
  },
  scrollChange: function(){
    var newColumnWidth = ScrollStore.getColumnWidth(this.props.gridId);

    if (this.state !== newColumnWidth) {
      // Set the state.
      this.setState({
        columnWidth: newColumnWidth
      });
    }
  },
  componentDidMount: function(){
    // Register data listener
    DataStore.addChangeListener(this.dataChange);

    // Register scroll listener
    ScrollStore.addChangeListener(this.scrollChange);
  },
});
