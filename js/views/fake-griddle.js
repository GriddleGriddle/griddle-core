var React = require('react');
var DataStore = require('../stores/local-data-store');
var ScrollStore = require('../stores/scroll-store');
var LocalActions = require('../actions/local-action-creators');
var ScrollActions = require('../actions/scroll-action-creators');
var FakeData = require('../fake/fake-data');
var _ = require('lodash');

function getStateFromStore(){
  return {
    data: DataStore.getCurrentPage(),
    xScrollPosition: ScrollStore.getXScrollPosition(),
    yScrollPosition: ScrollStore.getYScrollPosition(),
    maxPages: DataStore.getPageCount()
  };
}

var PageSelect = React.createClass({
  propTypes: {
    maxPages: React.PropTypes.number.isRequired
  },

  handleSelect: function(e){
    LocalActions.loadPage(parseInt(e.target.value));
  },

  render: function(){
    var options = _.map(_.range(this.props.maxPages), function(i){
      return <option value={i}>{i}</option>;
    });

    return <select onChange={this.handleSelect}>
      {options}
    </select>
  }
});

module.exports = React.createClass({
  render: function(){
    var rows = _.map(this.state.data, function(item){
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
        <div ref="scrollable" onScroll={this.gridScroll} style={tableWrapperStyle}>
          <table>
            {rows}
          </table>
        </div>

        <button type="button" onClick={this.handlePrevious}>Previous</button>
        <PageSelect maxPages={this.state.maxPages} />
        <button type="button" onClick={this.handleNext}>Next</button>
      </div>
    );
  },
  handleFilter: function(e){
    LocalActions.filterData(e.target.value);
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
