import Immutable from 'immutable';

export default Immutable.fromJS({
  data: [],
  visibleData: [],
  columnTitles: [],
  columnProperties: {},
  allColumns: [],
  hasNext: false,
  hasPrevious: false,
  pageProperties: {
    currentPage: 0,
    maxPage: 0,
    pageSize: 0
  }
});