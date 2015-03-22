var React = require('react');
var DataStore = require('../stores/data-store');
var ScrollStore = require('../stores/scroll-store');
var LocalActions = require('../actions/local-action-creators');
var ScrollActions = require('../actions/scroll-action-creators');
var FakeData = require('../fake/fake-data');
var _ = require('lodash');

function getStateFromStore(){
  return {
    data: DataStore.getVisibleData(),
    xScrollPosition: ScrollStore.getXScrollPosition(),
    yScrollPosition: ScrollStore.getYScrollPosition()
  };
}

module.exports = React.createClass({
  render: function(){
    var rows = _.map(this.state.data, function(item){
      return <tr>
      {_.map(_.keys(item), function(key){
        return <td>{item[key]}</td>
      })}
      </tr>
    });

    return (
      <div>
      <input type="text" onChange={this.handleFilter} />
        <div ref="scrollable" onScroll={this.gridScroll} style={{"height":"400px", "overflowY": "scroll"}}>
          <table>
            {rows}
          </table>
        </div>

        <button type="button" onClick={this.handleClick}>Load</button>
      </div>
    );
  },
  handleFilter: function(e){
    LocalActions.filterData(e.target.value);
  },
  handleClick: function(){
    LocalActions.loadData(FakeData);
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
