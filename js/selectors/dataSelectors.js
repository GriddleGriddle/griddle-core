import Immutable from 'immutable';
import MAX_SAFE_INTEGER from 'max-safe-integer';
import { createSelector } from 'reselect';
import { getVisibleDataColumns, getDataForColumns } from '../utils/dataUtils'

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
export const sortColumnsShouldSortAscendingSelector = state => (state.get('sortDirections') || [])

//the properties that determine how things are rendered
export const renderPropertiesSelector = state => state.get('renderProperties');

export const allColumnsSelector = createSelector(
  dataSelector,
  (data) => (data.size === 0 ? [] : data.get(0).keySeq().toJSON())
)

//gets the metadata columns or nothing
export const metaDataColumnsSelector = state => (state.get('metadataColumns') || [])

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

//get the visible data (and only the columns that are visible)
export const visibleDataSelector = createSelector(
  dataSelector,
  visibleColumnsSelector,
  (data, visibleColumns) => getVisibleDataColumns(data, visibleColumns)
)

export const currentPageDataSelector = createSelector(
  visibleDataSelector,
  (visibleData) => visibleData
)

export const hiddenColumnsSelector = createSelector(
  visibleColumnsSelector,
  allColumnsSelector,
  metaDataColumnsSelector,
  (visibleColumns, allColumns, metaDataColumns) => {
    const removeColumns = [...visibleColumns, ...metaDataColumns];

    return allColumns.filter(c => removeColumns.indexOf(c) === -1);
  }
)

export const renderableColumnsSelector = createSelector(
  visibleColumnsSelector,
  hiddenColumnsSelector,
  (visibleColumns, hiddenColumns) => [...visibleColumns, ...hiddenColumns]
)

//TODO: this needs some tests
export const hiddenDataSelector = createSelector(
  currentPageDataSelector,
  visibleColumnsSelector,
  allColumnsSelector,
  metaDataColumnsSelector,
  (currentPageData, visibleColumns, allColumns, metaDataColumns) => {
    return getDataForColumns(currentPageData, keys)
  }
)

//TODO: this needs some tests
export const metaDataSelector = createSelector(
  currentPageDataSelector,
  metaDataColumnsSelector,
  (currentPageData, metaDataColumns) => { return getDataForColumns(currentPageData, metaDataColumns) }
)

//TODO: This NEEDS tests
export const columnTitlesSelector = createSelector(
  visibleDataSelector,
  metaDataSelector,
  renderPropertiesSelector,
  (visibleData, metaData, renderProperties) => {
    if(visibleData.size > 0) {
      return Object.keys(visibleData.get(0).toJSON()).map(k =>
        renderProperties.get('columnProperties').get(k).get('displayName') || k
      )
    }

    return [];
  }
)

export const griddleStateSelector = createSelector(
  visibleDataSelector,
  metaDataSelector,
  currentPageDataSelector,
  renderPropertiesSelector,
  columnTitlesSelector,
  allColumnsSelector,
  renderableColumnsSelector,
  (visibleData, metaData, currentPageData, renderProperties, columnTitles, allColumns, renderableColumns) => ({
    visibleData,
    metaData,
    currentPageData,
    renderProperties,
    columnTitles,
    allColumns,
    renderableColumns
  })
)
