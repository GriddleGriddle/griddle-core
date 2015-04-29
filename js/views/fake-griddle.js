var React = require('react');
var DataStore = require('../stores/local-data-store');
var ScrollStore = require('../stores/scroll-store');
var LocalActions = require('../actions/local-action-creators');
var ScrollActions = require('../actions/scroll-action-creators');
var FakeData = require('../fake/fake-data');
var SpacerRow = require('./spacer-row');
var _ = require('lodash');
var assign = require('object-assign');

function getStateFromStore(gridId){
  return {
    dataState: DataStore.getState(gridId),
    xScrollPosition: ScrollStore.getXScrollPosition(gridId),
    yScrollPosition: ScrollStore.getYScrollPosition(gridId),
    tableHeight: ScrollStore.getTableHeight(gridId),
    tableWidth: ScrollStore.getTableHeight(gridId),
    rowHeight: ScrollStore.getRowHeight(gridId),
    pageProperties: DataStore.getPageProperties(gridId),
  };
}

var PageSelect = React.createClass({
  propTypes: {
    pageProperties: React.PropTypes.object.isRequired,
    gridId: React.PropTypes.string.isRequired
  },

  handleSelect: function(e){
    LocalActions.loadPage(this.props.gridId, parseInt(e.target.value - 1));
  },

  render: function(){
    var options = _.map(_.range(this.props.pageProperties.maxPage), function(i){
      return <option value={i + 1}>{i + 1}</option>;
    });
    return <select value={this.props.pageProperties.currentPage + 1} onChange={this.handleSelect}>
      {options}
    </select>
  }
});

var FakeGriddle = React.createClass({
  render: function(){
    if(!this.state.dataState) { return <h1>Nothing</h1>; }

    var rows = _.map(this.state.dataState.currentDataPage, function(item){
      return <tr>
      {_.map(_.keys(item), function(key){
        return <td>{item[key]}</td>
      })}
      </tr>
    });

    var tableWrapperStyle = {
      "top": this.state.yScrollPosition + "px",
      "left": this.state.xScrollPosition + "px",
      "height": this.state.tableHeight + "px",
      "width": this.state.tableWidth + "px",
      "overflow": "scroll"
    };

    return (
      <div>
      <input type="text" onChange={this.handleFilter} />
      <input type="text" onChange={this.handleUpdatePageSize} />
        <div ref="scrollable" onScroll={this.gridScroll} style={tableWrapperStyle}>
          <table>
            <tbody>
              <SpacerRow gridId={this.state.gridId} position="top"/>
              {rows}
              <SpacerRow gridId={this.state.gridId} position="bottom"/>
            </tbody>
          </table>
        </div>

        <button type="button" onClick={this.handlePrevious}>Previous</button>
        <PageSelect gridId={this.state.gridId} pageProperties={this.state.pageProperties} />
        <button type="button" onClick={this.handleNext}>Next</button>
      </div>
    );
  },

  handleFilter: function(e){
    LocalActions.filterData(this.state.gridId, e.target.value);
  },

  handleUpdatePageSize: function(e){
    LocalActions.setPageSize(this.state.gridId, parseInt(e.target.value));
  },

  handleNext: function(e){
    LocalActions.loadNext(this.state.gridId);
  },

  handlePrevious: function(e){
    LocalActions.loadPrevious(this.state.gridId);
  },

  dataChange: function(){
    this.setState(getStateFromStore(this.state.gridId))
  },

  scrollChange: function(){
    var newState = {
      xScrollPosition: ScrollStore.getXScrollPosition(this.state.gridId),
      yScrollPosition: ScrollStore.getYScrollPosition(this.state.gridId)
    };
    // Update the scroll position, if necessary.
    var scrollable = React.findDOMNode(this.refs.scrollable);
    if (scrollable !== null &&
      (scrollable.scrollLeft !== newState.xScrollPosition || scrollable.scrollTop !== newState.yScrollPosition)) {
      scrollable.scrollLeft = newState.xScrollPosition;
      scrollable.scrollTop = newState.yScrollPosition;
    }

    // Set the state.
    this.setState(newState);
  },

  componentWillMount: function(){
    var gridId = _.uniqueId("grid");
    this.setState({gridId: gridId});

    LocalActions.initializeGrid(gridId);
  },

  componentDidMount: function(){
    // Register data listener
    DataStore.addChangeListener(this.dataChange);

    // Register scroll listener and fire off initial scroll change.
    ScrollStore.addChangeListener(this.scrollChange);
    this.scrollChange();
    LocalActions.loadData(this.state.gridId, FakeData);
  },

  componentWillUnmount: function(){
    DataStore.removeChangeListener(this.dataChange);
    ScrollStore.removeChangeListener(this.scrollChange);

    LocalActions.removeGrid(this.state.gridId);
  },

  gridScroll: function(){
    var scrollable = React.findDOMNode(this.refs.scrollable);
    ScrollActions.setScrollPosition(this.state.gridId, scrollable.scrollLeft, scrollable.scrollWidth, scrollable.scrollTop, scrollable.scrollHeight)
  }
});

module.exports = FakeGriddle;
