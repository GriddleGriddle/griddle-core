var React = require('react');
var DataStore = require('../stores/local-data-store');
var ScrollStore = require('../stores/scroll-store');
var LocalActions = require('../actions/local-action-creators');
var ScrollActions = require('../actions/scroll-action-creators');

function getStateFromStore(){
  var pageProperties = DataStore.getPageProperties();

  return {
    rowHeight: ScrollStore.getRowHeight(),
    visibleDataLength: DataStore.getVisibleData().length,
    initialDisplayIndex: pageProperties.initialDisplayIndex, 
    lastDisplayIndex: pageProperties.lastDisplayIndex
  };
}

module.exports = React.createClass({
  getDefaultProps: function() {
    return{
      "position": "top"
    };
  },
  render: function(){
    // Get the length of rows that the spacer row will represent.
    var spacerRowCount = this.state.position === "top" ? this.state.visibleDataLength * this.state.initialDisplayIndex :
      this.state.visibleDataLength * this.state.lastDisplayIndex;

    // Get the height in pixels.
    var height = this.state.rowHeight * spacerRowCount;
    var spacerRowHeight = { height: height + "px" };
    return (
      <tr key={this.props.position + '-' + height} style={spacerRowHeight}></tr>
    );
  },
  getInitialState: function(){
    return getStateFromStore();
  },
  dataChange: function(){
    var newState = getStateFromStore();
    if (newState.visibleDataLength !== this.state.visibleDataLength ||
        newState.initialDisplayIndex !== this.state.initialDisplayIndex ||
        newState.lastDisplayIndex !== this.state.lastDisplayIndex) {
      this.setState(newState);
    }
  },
  scrollChange: function(){
    var newRowHeight = ScrollStore.getRowHeight();

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
