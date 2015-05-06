var React = require('react');
var DataStore = require('../stores/local-data-store');
var ScrollStore = require('../stores/scroll-store');
var LocalActions = require('../actions/local-action-creators');
var ScrollActions = require('../actions/scroll-action-creators');
var _ = require('lodash');

function getStateFromStore(gridId){
  return {
    columnProperties: DataStore.getColumnProperties(gridId)
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
    var spacerColumnStyle = {
      width: (this.props.position === "left" ? this.state.columnProperties.getLeftHiddenColumnWidth() : this.state.columnProperties.getRightHiddenColumnWidth()) + "px"
    };

    return this.props.header ? (<th key={this.props.position + '-' + spacerColumnStyle.width} style={spacerColumnStyle}></th>) : (
      <td key={this.props.position + '-' + spacerColumnStyle.width} style={spacerColumnStyle}></td>
    );
  },
  getInitialState: function(){
    return getStateFromStore(this.props.gridId);
  },
  dataChange: function(){
    var newState = getStateFromStore(this.props.gridId);
    if (newState.columnProperties.getMaxColumnLength() !== this.state.columnProperties.getMaxColumnLength() ||
        newState.columnProperties.getInitialDisplayIndex() !== this.state.columnProperties.getInitialDisplayIndex() ||
        newState.columnProperties.getLastDisplayIndex() !== this.state.columnProperties.getLastDisplayIndex()) {
      this.setState(newState);
    }
  },
  componentDidMount: function(){
    // Register data listener
    DataStore.addChangeListener(this.dataChange);
  },
  componentWillUnmount: function(){
    DataStore.removeChangeListener(this.dataChange);
  }
});
