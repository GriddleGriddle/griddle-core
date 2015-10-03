import Immutable from 'immutable';

export default Immutable.fromJS({
  currentPosition: {
    xScrollChangePosition: 0,
    yScrollChangePosition: 0,
    renderedStartDisplayIndex: 0,
    renderedEndDisplayIndex: 20,
    visibleDataLength: 20,
    tableHeight: 500,
    tableWidth: 300,
    rowHeight: 20,
    defaultColumnWidth: 80,
    infiniteScrollLoadTreshold: 50
  },
  renderedData: []
});