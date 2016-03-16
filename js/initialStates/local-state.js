import Immutable from 'immutable';

export default Immutable.fromJS({
  pageProperties: {
    pageSize: 10,
    currentPage: 1,
    sortColumns: [],
    sortAscending: true
  },
  filter: '',
  columnFilters: [],
});
