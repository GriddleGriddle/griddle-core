import Immutable from 'immutable';
import MAX_SAFE_INTEGER from 'max-safe-integer';
import { getVisibleDataColumns, getDataForColumns } from '../utils/dataUtils'
import { createSelector } from 'reselect';

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
export const sortColumnsShouldSortAscendingSelector = state => (state.get('sortDirections') || [])

//the properties that determine how things are rendered
export const renderPropertiesSelector = state => state.get('renderProperties');

export const allColumnsSelector = createSelector(
  dataSelector,
  (data) => (data.size === 0 ? [] : data.get(0).keySeq().toJSON())
)

//gets the metadata columns or nothing
export const metaDataColumnsSelector = state => (state.get('metadataColumns') || [])

//is there a next page
export const hasNextSelector = createSelector(
  currentPageSelector,
  maxPageSelector,
  (currentPage, maxPage) => (maxPage > currentPage)
)

//is there a previous page?
export const hasPreviousSelector = state => (state.getIn(['pageProperties', 'currentPage']) > 1);

export const metaDataSelector = state => state.get('metaData')

export const columnTitlesSelector = createSelector(
  dataSelector,
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
  dataSelector,
  metaDataSelector,
  renderPropertiesSelector,
  columnTitlesSelector,
  allColumnsSelector,
  (visibleData, metaData, currentPageData, renderProperties, columnTitles, allColumns, renderableColumns) => ({
    visibleData,
    metaData,
    currentPageData,
    renderProperties,
    columnTitles,
    allColumns,
  })
)
