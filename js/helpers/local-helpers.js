import * as DataHelpers from './data-helpers';

export function getVisibleData(state) {
  //get the max page / current page and the current page of data
  const pageSize = state.getIn(['pageProperties', 'pageSize']);
  const currentPage = state.getIn(['pageProperties', 'currentPage']);
  let data =  getDataSet(state)
    .skip(pageSize * (currentPage-1)).take(pageSize);

  data = DataHelpers.getDataColumns(state, data);

  return data;
}

export function hasNext(state) {
  return state.getIn(['pageProperties', 'currentPage']) <
    state.getIn(['pageProperties', 'maxPage']);
}

export function hasPrevious(state) {
  return state.getIn(['pageProperties', 'currentPage']) > 1;
}

export function getDataSet(state) {
  if(!!state.get('filter')){
    return state.get('filteredData');
  }

  return state.get('data');
}

export function filter(state, filter) {
  //TODO: We need to support filtering by specific columns
  var filtered = state.get('data')
    .filter(row  => {
      return Object.keys(row.toJSON())
        .some(key => {
          return row.get(key) && row.get(key).toString().toLowerCase().indexOf(filter.toLowerCase()) > -1 
        })
      })

   //TODO: Merge this with the filter settings in GRIDDLE_FILTERED because they are the same
   const newState = state
     .set('filteredData', filtered)
     .set('filter', filter)
     .setIn(['pageProperties', 'currentPage'], 1)
   return updateVisibleData(newState
    .setIn(
      ['pageProperties', 'maxPage'],
      DataHelpers.getPageCount(
        //use getDataSet to make sure we're not getting rid of sort/etc
        getDataSet(newState).length,
        newState.getIn(['pageProperties', 'pageSize']))));
}

export function sortByColumns(state, columns, sortAscending=true) {
  if(columns.length === 0 || !state.get('data')) { return state; }

  //TODO: this should compare the whole array
  const reverse = state.getIn(['sortProperties', 'sortAscending']) === true && state.getIn(['sortProperties', 'sortColumns'])[0] === columns[0];
  let sorted = state.set(
    'data',
    state.get('data').sort(
    (original, newRecord) => {
      original = (!!original.get(columns[0]) && original.get(columns[0])) || "";
      newRecord = (!!newRecord.get(columns[0]) && newRecord.get(columns[0])) || "";

      //TODO: This is about the most cheezy sorting check ever.
      //Make it be able to sort for dates / monetary / regex / whatever
      if(original === newRecord) {
        return 0;
      } else if (original > newRecord) {
        return 1;
      }
      else {
        return -1;
      }
    })
  )
  .setIn(['sortProperties', 'sortAscending'], !reverse)
  .setIn(['sortProperties', 'sortColumns'], columns);

  if(reverse){
    sorted = sorted.set('data', sorted.get('data').reverse());
  }

  //if filter is set we need to filter
  if(!!state.get('filter')) {
    sorted = filter(sorted, sorted.get('filter'));
  }


  return updateVisibleData(sorted);
}

/*
  This function is used to remove some boiler plate that occurs in many of the reducers
*/
export function updateVisibleData(state) {
  return state
    .set('visibleData', getVisibleData(state))
    .set('hasNext', hasNext(state))
    .set('hasPrevious', hasPrevious(state));
}

export function getPage(state, pageNumber) {
  const maxPage = DataHelpers.getPageCount(
    getDataSet(state).length,
    state.getIn(['pageProperties', 'pageSize']));

  if(pageNumber >= 1 && pageNumber <= maxPage) {
    return updateVisibleData(
      state
        .setIn(['pageProperties', 'currentPage'], pageNumber)
        .setIn(['pageProperties', 'maxPage'], maxPage));
  }

  return state;
}
