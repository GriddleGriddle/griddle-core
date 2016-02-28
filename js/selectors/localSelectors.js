import Immutable from 'immutable';
import MAX_SAFE_INTEGER from 'max-safe-integer';
import { createSelector } from 'reselect';
import { getVisibleDataColumns } from '../utils/dataUtils'

//oy - not a fan -- refactor asap because this is no good
let localUtils = null;
export const registerUtils = utils => { localUtils = utils }

//this will get the utils or throw an error
export const getUtils = () => {
  if (localUtils) {
    return localUtils;
  }

  console.error("Please call registerUtils with a util object when initializing the selectors");
}

//gets the full dataset currently tracked by griddle
export const dataSelector = state => state.get('data');

//gets the number of records to display
export const pageSizeSelector = state => state.getIn(['pageProperties', 'pageSize']);

//what's the current page
export const currentPageSelector = state => state.getIn(['pageProperties', 'currentPage']);

//max page number
export const maxPageSelector = createSelector(
  pageSizeSelector,
  dataSelector,
  (pageSize, data) => {
    const total = data.size;
    const calc = total / pageSize;

    return calc > Math.floor(calc) ? Math.floor(calc) + 1 : Math.floor(calc);
  }
)
//what's the current selector
export const filterSelector = state => state.get('filter')||'';

//gets the current sort columns
export const sortColumnsSelector = state => (state.get('sortColumns')||[])

//gets the current sort direction (this is an array that corresponds to columns) records are true if sortAscending
export const sortColumnsShouldSortAscendingSelector = state => (state.get('sortDirections')||[])

//the properties that determine how things are rendered
export const renderPropertiesSelector = state => state.get('renderProperties');

export const allColumnsSelector = createSelector(
  dataSelector,
  (data) => (data.size === 0 ? [] : data.get(0).keySeq().toJSON())
)

//gets the column property objects ordered by order
export const sortedColumnPropertiesSelector = createSelector(
  renderPropertiesSelector,
  (renderProperties) => (
    renderProperties && renderProperties.get('columnProperties') && renderProperties.get('columnProperties').size !== 0 ?
      renderProperties.get('columnProperties')
        .sortBy(col => (col && col.get('order'))||MAX_SAFE_INTEGER) :
      null
  )
)

//gets the visible columns
export const visibleColumnsSelector = createSelector(
  sortedColumnPropertiesSelector,
  allColumnsSelector,
  (sortedColumnProperties, allColumns) => (
    sortedColumnProperties ? sortedColumnProperties
      .keySeq()
      .toJSON() :
    allColumns
  )
)

//is there a next page
export const hasNextSelector = createSelector(
  currentPageSelector,
  maxPageSelector,
  (currentPage, maxPage) => (currentPage < maxPage)
);

//is there a previous page?
export const hasPreviousSelector = state => (state.getIn(['pageProperties', 'currentPage']) > 1);

//get the filtered data
export const filteredDataSelector = createSelector(
  dataSelector,
  filterSelector,
  (data, filter) => {
    return data.filter(row  => {
      return Object.keys(row.toJSON())
        .some(key => {
          return row.get(key) && row.get(key).toString().toLowerCase().indexOf(filter.toLowerCase()) > -1
        })
      })
  }
)

export const sortedDataSelector = createSelector(
  filteredDataSelector,
  sortColumnsSelector,
  sortColumnsShouldSortAscendingSelector,
  renderPropertiesSelector,
  (filteredData, sortColumns, sortColumnsShouldSortAscending, renderProperties) => {
    const sortType = renderProperties && renderProperties.get('columnProperties')
    return getUtils().getSortedData(filteredData, sortColumns, sortColumnsShouldSortAscending[0])
  }
)

export const currentPageDataSelector = createSelector(
  sortedDataSelector,
  pageSizeSelector,
  currentPageSelector,
  (sortedData, pageSize, currentPage) => {
    return sortedData
      .skip(pageSize * (currentPage - 1))
      .take(pageSize);
  }
)

//get the visible data (and only the columns that are visible)
export const visibleDataSelector = createSelector(
  currentPageDataSelector,
  visibleColumnsSelector,
  (currentPageData, visibleColumns) => getVisibleDataColumns(currentPageData, visibleColumns)
)

