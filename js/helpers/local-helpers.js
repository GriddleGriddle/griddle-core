import {
  getPageCount,
  getDataColumns,
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
  return getVisibleDataColumns(data, columns);
}

export function hasNext(state) {
  return state.getIn(['pageProperties', 'currentPage']) <
    state.getIn(['pageProperties', 'maxPage']);
}

export function hasPrevious(state) {
  return state.getIn(['pageProperties', 'currentPage']) > 1;
}

export function getDataSet(state) {
  let data = null;

  //filtered data
  if(state.get('filter') && state.get('filter') !== '') {
    data = filterData(state.get('data'), state.get('filter'));
  }

  //full data
  data = data || state.get('data');

  //filter data by columns
  if(state.get('columnFilters') && state.get('columnFilters').size > 0) {
    data = filterDataByColumns(data, state.get('columnFilters'));
  }

  return data;
}

export function filterData(data, filter) {
    return data.filter(row  => {
      return Object.keys(row.toJSON())
        .some(key => {
          return row.get(key) && row.get(key).toString().toLowerCase().indexOf(filter.toLowerCase()) > -1
        })
      })
}

export function filterDataByColumns(data, filters) {
  //filters is an immutable list
  //go through the list and apply the filter to the data based on the filter
  return filters.reduce((previous, current) => {
    const { column, filter } = current;

    return previous.filter(row => row.get(column) &&
      row.get(column)
        .toString()
        .toLowerCase()
        .indexOf(filter.toLowerCase()) > -1)
  }, data)
}

export function dateSort(data, column, sortAscending = true) {
  return data.sort(
    (original, newRecord) => {
      original = (!!original.get(column) && new Date(original.get(column))) || null;
      newRecord = (!!newRecord.get(column) && new Date(newRecord.get(column))) || null;
      if(original.getTime() === newRecord.getTime()) {
        return 0;
      } else if (original > newRecord) {
        return sortAscending ?  1 : -1;
      } else {
        return sortAscending ? -1 : 1;
      }
    })
}

export function defaultSort(data, column, sortAscending = true) {
  return data.sort(
    (original, newRecord) => {
      original = (!!original.get(column) && original.get(column)) || "";
      newRecord = (!!newRecord.get(column) && newRecord.get(column)) || "";

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

export function sortTypes(type) {
  return {
    "default": defaultSort,
    "date": dateSort,
  }
}

export function getSortByType(type, helpers) {
  const sortType = ((helpers && helpers.sortTypes)||sortTypes)();
  return sortType.hasOwnProperty(type) ? sortType[type] : defaultSort
}

export function getSortedData(data, columns, helpers, sortAscending = true, sortType = "default") {
  return getSortByType(sortType, helpers)(data, columns[0], sortAscending, helpers);
}

//TODO: Consider renaming sortAscending here to sortDescending
export function updateSortColumns(state, columns, sortAscending = null) {
  if(columns.length === 0) { return state; }

  const shouldSortAscending = sortAscending !== null ?
    sortAscending :
    !(state.getIn(['pageProperties', 'sortAscending']) === true &&
      state.getIn(['pageProperties', 'sortColumns'])[0] === columns[0]);

  return state.setIn(['pageProperties', 'sortAscending'], shouldSortAscending)
              .setIn(['pageProperties', 'sortColumns'], columns);
}

export function sortDataByColumns(state, helpers) {
  if(!state.get('data')) { return state; }

  //TODO: Clean this up
  const allColumnProperties = state.getIn(['renderProperties', 'columnProperties']);
  const sortColumns = state.getIn(['pageProperties', 'sortColumns']);
  //TODO: Make sort for more than just the first column
  const columnProperties = sortColumns && sortColumns.length > 0 ?
    allColumnProperties.get(sortColumns[0]) :
    null;

  const sortType = (columnProperties && columnProperties.get('sortType')) || null;
  let sorted = state.set(
    'data',
    (helpers && helpers.getSortedData||getSortedData)(
      state.get('data'),
      sortColumns,
      helpers,
      state.getIn(['pageProperties', 'sortAscending']),
      sortType
    )
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
