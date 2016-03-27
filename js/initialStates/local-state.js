import Immutable from 'immutable';

export default Immutable.fromJS({
  pageProperties: {
    pageSize: 10,
    currentPage: 1,
  },
  metadataColumns: ['griddleKey'],
  filter: '',
  sortColumns: [],
  sortDirections: []
});
