// Override of implementation from 'local-helpers'
export function getPageData(state, pageSize, currentPage) {
  const remoteDataIndex = state.get('pagesLoaded').indexOf(currentPage);
  return helpers.getDataSet(state).skip(pageSize * (remoteDataIndex)).take(pageSize);
}

// Override of implementation from 'local-helpers'
export function filterData(data, filter) {
  // Simply return the data.
  return data;
}

// Override of implementation from 'local-helpers'
export function getSortedData(data, columns, sortAscending = true) {
  // Simply return the data.
  return data;
}

// Override of implementation from 'local-helpers'
export function sortByColumns(state, columns, sortAscending = null) {
  // Simply return the data.
  return state.get('data');
}