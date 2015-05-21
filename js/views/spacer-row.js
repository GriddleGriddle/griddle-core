'use strict';

var React = require('react');

class SpacerRow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let height = 0, spacerRowStyle = {};
    if (this.props.positionData) {
      // Get the length of rows that the spacer row will represent.
      let spacerRowCount = this.props.placement === 'top' ? this.props.positionData.renderedStartDisplayIndex :
        this.props.positionData.visibleDataLength - this.props.positionData.renderedEndDisplayIndex;

      // Get the height in pixels.
      height = this.props.positionData.rowHeight * spacerRowCount;
    }

    spacerRowStyle.height = height + 'px';

    return (
      <tr key={this.props.placement + '-' + height} style={spacerRowStyle}></tr>
    );
  }
}
SpacerRow.defaultProps  = {
  'placement': 'top',
  'positionData': null
};

module.exports = SpacerRow;