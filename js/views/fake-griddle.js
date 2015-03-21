var React = require('react');
var DataStore = require('../stores/data-store');
var LocalActions = require('../actions/local-action-creators'); 
var FakeData = require('../fake/fake-data');
var _ = require('lodash');

function getStateFromStore(){
  return {data: DataStore.getVisibleData() }
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
        <table>
          {rows}
        </table>

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
  getInitialState: function(){
    return getStateFromStore();
  },
  componentDidMount: function(){
    DataStore.addChangeListener(this.dataChange); 
  },
  componentWillUnmount: function(){
    DataStore.removeChangeListener(this.dataChange); 
  }
});
