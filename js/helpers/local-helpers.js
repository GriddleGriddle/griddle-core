import {
  getPageCount,
  getDataColumns,
  getSortedColumns,
  getVisibleDataColumns,
  addKeyToRows
} from './data-helpers';
import Immutable from 'immutable';

export { addKeyToRows as addKeyToRows };
export { getPageCount as getPageCount };

export function getVisibleData(state) {

  //get the max page / current page and the current page of data
  const pageSize = state.getIn(['pageProperties', 'pageSize']);
  const currentPage = state.getIn(['pageProperties', 'currentPage']);

  const data =  getDataSet(state)
    .skip(pageSize * (currentPage-1)).take(pageSize);

  const columns = getDataColumns(state, data);

  return getVisibleDataColumns(getSortedColumns(data, columns), columns);
}

export function hasNext(state) {
  return state.getIn(['pageProperties', 'currentPage']) <
    state.getIn(['pageProperties', 'maxPage']);
}

export function hasPrevious(state) {
  return state.getIn(['pageProperties', 'currentPage']) > 1;
}

export function getDataSet(state) {
  if(state.get('filter') && state.get('filter') !== '') {
    return filterData(state.get('data'), state.get('filter'));
  }

  return state.get('data');
}

export function filterData(data, filter) {
    return data.filter(row  => {
      return Object.keys(row.toJSON())
        .some(key => {
          return row.get(key) && row.get(key).toString().toLowerCase().indexOf(filter.toLowerCase()) > -1
        })
      })
}

export function getSortedData(data, columns, sortAscending = true) {
  return data.sort(
    (original, newRecord) => {
      original = (!!original.get(columns[0]) && original.get(columns[0])) || "";
      newRecord = (!!newRecord.get(columns[0]) && newRecord.get(columns[0])) || "";

      //TODO: This is about the most cheezy sorting check ever.
      //Make it be able to sort for dates / monetary / regex / whatever
      if(original === newRecord) {
        return 0;
      } else if (original > newRecord) {
        return sortAscending ? 1 : -1;
      }
      else {
        return sortAscending ? -1 : 1;
      }
    });
}


//TODO: Consider renaming sortAscending here to sortDescending
export function updateSortColumns(state, columns, sortAscending = null) {
  if(columns.length === 0) { return state; }

  const reverse = sortAscending !== null ? sortAscending :
    (state.getIn(['pageProperties', 'sortAscending']) === true && state.getIn(['pageProperties', 'sortColumns'])[0] === columns[0]);

  return state.setIn(['pageProperties', 'sortAscending'], !reverse)
              .setIn(['pageProperties', 'sortColumns'], columns);
}

export function sortDataByColumns(state) {
  if(!state.get('data')) { return state; }

  let sorted = state.set(
    'data',
    getSortedData(state.get('data'), state.getIn(['pageProperties', 'sortColumns']), state.getIn(['pageProperties', 'sortAscending']))
  );

  //if filter is set we need to filter
  //TODO: filter the data when it's being sorted
  if(!!state.get('filter')) {
    sorted = filter(sorted, sorted.get('filter'));
  }

  return sorted;
}

export function getDataSetSize(state) {
  return getDataSet(state).size;
}

export function getPage(state, pageNumber) {
  const maxPage = getPageCount(
    getDataSetSize(state),
    state.getIn(['pageProperties', 'pageSize']));

  if(pageNumber >= 1 && pageNumber <= maxPage) {
    return state
        .setIn(['pageProperties', 'currentPage'], pageNumber)
        .setIn(['pageProperties', 'maxPage'], maxPage);
  }

  return state;
}
