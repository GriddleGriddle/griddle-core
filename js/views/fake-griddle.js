var React = require('react');
var DataStore = require('../stores/data-store');
var LocalActions = require('../actions/local-action-creators'); 
var _ = require('lodash');

function getStateFromStore(){
  return {data: DataStore.getData() }
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
        <table>
          {rows}
        </table>

        <button type="button" onClick={this.handleClick}>Load</button> 
      </div>
    );
  },
  handleClick: function(){
    LocalActions.loadData([
      {"name": "Luke Skywalker", 
      "occupation": "Jedi", 
      "hometown": "Tatooine"},
      {"name": "Chewbacca", 
      "occupation": "Wookie", 
      "hometown": "Kashyyk"},
      {"name": "Palpatine", 
      "occupation": "Emperor", 
      "hometown": "Naboo"}
    ]);
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
