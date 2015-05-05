var React = require('react');
var DataStore = require('../stores/local-data-store');
var ScrollStore = require('../stores/scroll-store');
var LocalActions = require('../actions/local-action-creators');
var ScrollActions = require('../actions/scroll-action-creators');
var _ = require('lodash');
var Draggable = require('react-draggable');

module.exports = React.createClass({
  getDefaultProps: function(){
    return{
      "column": null,
      "columnName": ""
    };
  },
  getInitialState: function(){
    return{
      currentPosition: 0
    };
  },
  componentWillMount: function(){
    var columnMetadata = DataStore.getColumnProperties(this.props.gridId).getColumnMetadata();
    // Set the initial width
    this.setState({currentWidth: columnMetadata[this.props.column].columnWidth});
  },
  render: function(){

      // This is really cheesy, but this makes up for the translation applied by react-draggable
      var offsetTranslation = "translate(" + (-1*this.state.currentPosition) + "px, 0px)";
      var offsetStyle = {
        translate: offsetTranslation,
        webkitTransform: offsetTranslation
      };

      return (<div style={offsetStyle}>
                <Draggable axis="x" onStart={this.dragStart} onDrag={this.dragMove}>
                  <div>
                    {this.props.columnName}
                    <div style={{float: "right", cursor: "pointer"}}>
                      <span style={{borderLeft: "4px solid"}}></span>
                    </div>
                  </div>
                </Draggable>
              </div>);
  },
  dragStart: function(event, ui){
    this.setState({currentPosition: ui.position.left});
  },
  dragMove: function(event, ui){
    var change = ui.position.left - this.state.currentPosition;
    LocalActions.resizeColumn(this.props.gridId, this.props.column, change);
    this.setState({currentPosition: ui.position.left});
  }
});
