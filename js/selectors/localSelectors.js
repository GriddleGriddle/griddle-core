import Immutable from 'immutable';
import { createSelector } from 'reselect';
import sortUtils from '../utils/sortUtils';

//gets the full dataset currently tracked by griddle
export const dataSelector = state => state.get('data');

//gets the number of records to display
export const pageSizeSelector = state => state.getIn(['pageProperties', 'pageSize']);

//what's the current page
export const currentPageSelector = state => state.getIn(['pageProperties', 'currentPage']);

//max page number
export const maxPageSelector = state => state.getIn(['pageProperties', 'maxPage']);

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

export const sortedColumnPropertiesSelector = createSelector(
  renderPropertiesSelector,
  (renderProperties) => (
    renderProperties && renderProperties.get('columnProperties') && renderProperties.get('columnProperties').size > 0 ?
      renderProperties.get('columnProperties')
        .sortBy(col => col.get('order')||MAX_SAFE_INTEGER) :
      null
  )
)

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
const a = sortUtils;
    return data.filter(row  => {
      return Object.keys(row.toJSON())
        .some(key => {
          return row.get(key) && row.get(key).toString().toLowerCase().indexOf(filter.toLowerCase()) > -1
        })
      })
  }
)

export const getSortedData = createSelector(
  filteredDataSelector,
  sortColumnsSelector,
  sortColumnsShouldSortAscendingSelector,
  renderPropertiesSelector,
  (filteredData, sortColumns, sortColumnsShouldSortAscending, renderProperties) => {
    const sortType = renderProperties && renderProperties.get('columnProperties')
    this.utils.getSortedData(filteredData, sortColumns, sortColumnsShouldSortAscending[0])
  }
)

//get the visible data (and only the columns that are visible)
/*export const getVisibleData = createSelector(
  visibleColumnsSelector,

)*/
