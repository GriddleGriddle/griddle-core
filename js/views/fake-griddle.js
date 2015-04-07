var React = require('react');
var DataStore = require('../stores/local-data-store');
var ScrollStore = require('../stores/scroll-store');
var LocalActions = require('../actions/local-action-creators');
var ScrollActions = require('../actions/scroll-action-creators');
var FakeData = require('../fake/fake-data');
var _ = require('lodash');

function getStateFromStore(){
  return {
    dataState: DataStore.getState(),
    xScrollPosition: ScrollStore.getXScrollPosition(),
    yScrollPosition: ScrollStore.getYScrollPosition(),
    pageProperties: DataStore.getPageProperties(),

  };
}

var PageSelect = React.createClass({
  propTypes: {
    pageProperties: React.PropTypes.object.isRequired
  },

  handleSelect: function(e){
    LocalActions.loadPage(parseInt(e.target.value - 1));
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
      "height":"400px",
      "width":"900px",
      "overflow": "scroll"
    };

    return (
      <div>
      <input type="text" onChange={this.handleFilter} />
      <input type="text" onChange={this.handleUpdatePageSize} />
        <div ref="scrollable" onScroll={this.gridScroll} style={tableWrapperStyle}>
          <table>
            <tbody>
              {rows}
            </tbody>
          </table>
        </div>

        <button type="button" onClick={this.handlePrevious}>Previous</button>
        <PageSelect pageProperties={this.state.pageProperties} />
        <button type="button" onClick={this.handleNext}>Next</button>
      </div>
    );
  },

  handleFilter: function(e){
    LocalActions.filterData(e.target.value);
  },

  handleUpdatePageSize: function(e){
    LocalActions.setPageSize(parseInt(e.target.value)); 
  },

  handleNext: function(e){
    LocalActions.loadNext();
  },

  handlePrevious: function(e){ 
    LocalActions.loadPrevious();
  },

  dataChange: function(){
    this.setState(getStateFromStore())
  },

  scrollChange: function(){
    var newState = {
      xScrollPosition: ScrollStore.getXScrollPosition(),
      yScrollPosition: ScrollStore.getYScrollPosition()
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

  getInitialState: function(){
    return getStateFromStore();
  },

  componentDidMount: function(){
    // Register data listener
    DataStore.addChangeListener(this.dataChange);

    // Register scroll listener and fire off initial scroll change.
    ScrollStore.addChangeListener(this.scrollChange);
    this.scrollChange();
    LocalActions.loadData(FakeData);
  },

  componentWillUnmount: function(){
    DataStore.removeChangeListener(this.dataChange);
    ScrollStore.removeChangeListener(this.scrollChange);
  },

  gridScroll: function(){
    var scrollable = React.findDOMNode(this.refs.scrollable);
    ScrollActions.setScrollPosition(scrollable.scrollLeft, scrollable.scrollTop)
  }
});

module.exports = FakeGriddle; 