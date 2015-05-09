var React = require('react');
var DataStoreClass = require('../stores/data-store');
var Flux = require('flux');
var dispatcher = new Flux.Dispatcher();
var DataStore = new DataStoreClass(dispatcher);
var LocalActionsClass = require('../actions/local-action-creators');
var LocalActions = new LocalActionsClass(dispatcher);
var FakeData = require('../fake/fake-data');
var SpacerRow = require('./spacer-row');
var SpacerColumn = require('./spacer-column');
var _ = require('lodash');
var assign = require('object-assign');

function getStateFromStore(gridId){
  return {
    dataState: DataStore.getState(),
    pageProperties: DataStore.getPageProperties(gridId),
  };
}

var PageSelect = React.createClass({
  propTypes: {
    pageProperties: React.PropTypes.object.isRequired,
    gridId: React.PropTypes.string.isRequired
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
  getDefaultProps(){
    return {
      isInfinite: false
    }
  },
  render: function(){
    debugger;
    var that = this;
    if(!this.state.dataState) { return <h1>Nothing</h1>; }
    var rows = _.map(this.state.dataState.data, (item) => {
      return <tr>
        {this.props.isInfinite ? <SpacerColumn gridId={that.state.gridId} position="left"/> : null }
        {_.map(_.keys(item), function(key){
          return that.state.dataState.currentVisibleColumns.indexOf(key) !== -1 ? (<td>{item[key]}</td>) : null;
        })}
        {this.props.isInfinite ? <SpacerColumn gridId={that.state.gridId} position="right"/> :null }
      </tr>
    });

    var columnSection = null;
    if (this.state.dataState.currentVisibleColumns.length > 0){
      columnSection = (
        <thead>
          <tr>
            {this.props.isInfinite ? <SpacerColumn gridId={that.state.gridId} position="left" header={true}/> : null }
            {_.map(this.state.dataState.currentVisibleColumns, function(item){
              return <th width={that.state.columnWidth + "px"}>{item}</th>
            })}
            {this.props.isInfinite ? <SpacerColumn gridId={that.state.gridId} position="right" header={true}/> : null}
          </tr>
        </thead>
      );
    }

    var tableStyle = {
      tableLayout: "fixed",
      width: "100%"
    };

    return (
      <div>
      <input type="text" onChange={this.handleFilter} />
      <input type="text" onChange={this.handleUpdatePageSize} />
        <div ref="scrollable" style={tableWrapperStyle}>
          <table style={tableStyle}>
            {columnSection}
            <tbody>
              {this.props.isInfinite ? <SpacerRow gridId={this.state.gridId} position="top"/> : null }
              {rows}
              {this.props.isInfinite ? <SpacerRow gridId={this.state.gridId} position="bottom"/> : null }
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
    this.setState(getStateFromStore());
  },

    componentWillMount: function(){
    var gridId = _.uniqueId("grid");
    this.setState({gridId: gridId});

    LocalActions.initializeGrid(gridId);
  },

  componentDidMount: function(){
    // Register data listener
    DataStore.addChangeListener(this.dataChange);

    LocalActions.loadData(FakeData);
  },

  componentDidUpdate: function(){
  },

  componentWillUnmount: function(){
    DataStore.removeChangeListener(this.dataChange);

    LocalActions.removeGrid();
  },
});

module.exports = FakeGriddle;
