var React = require('react');
var DataStore = require('../stores/local-data-store');
var ScrollStore = require('../stores/scroll-store');
var LocalActions = require('../actions/local-action-creators');
var ScrollActions = require('../actions/scroll-action-creators');
var _ = require('lodash');

function getStateFromStore(gridId){
  var pageProperties = DataStore.getPageProperties(gridId);

  return {
    rowHeight: ScrollStore.getRowHeight(gridId),
    visibleDataLength: DataStore.getVisibleData(gridId).length,
    initialDisplayIndex: pageProperties.initialDisplayIndex, 
    lastDisplayIndex: pageProperties.lastDisplayIndex,
    infiniteScroll: pageProperties.infiniteScroll
  };
}

module.exports = React.createClass({
  getDefaultProps: function() {
    return{
      "position": "top"
    };
  },
  render: function(){
    var height = 0, spacerRowStyle = {};
    if (this.state.infiniteScroll) {
      // Get the length of rows that the spacer row will represent.
      var spacerRowCount = this.props.position === "top" ? this.state.initialDisplayIndex :
        this.state.visibleDataLength - this.state.lastDisplayIndex;

      // Get the height in pixels.
      height = this.state.rowHeight * spacerRowCount;
      spacerRowStyle.height = height + "px";
    }

    return (
      <tr key={this.props.position + '-' + height} style={spacerRowStyle}></tr>
    );
  },
  getInitialState: function(){
    return getStateFromStore(this.props.gridId);
  },
  dataChange: function(){
    var newState = getStateFromStore(this.props.gridId);
    if (newState.visibleDataLength !== this.state.visibleDataLength ||
        newState.initialDisplayIndex !== this.state.initialDisplayIndex ||
        newState.lastDisplayIndex !== this.state.lastDisplayIndex) {
      this.setState(newState);
    }
  },
  scrollChange: function(){
    var newRowHeight = ScrollStore.getRowHeight(this.props.gridId);

    if (this.state !== newRowHeight) {
      // Set the state.
      this.setState({
        rowHeight: newRowHeight
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
