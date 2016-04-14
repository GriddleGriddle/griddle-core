import Immutable from 'immutable';
import MAX_SAFE_INTEGER from 'max-safe-integer';
import { getVisibleDataColumns, getDataForColumns } from '../utils/dataUtils'
import { createGriddleSelector } from '../utils/selectorUtils';

export default function(utils) {
  return {
    //max page number
    maxPageSelector: function (state, props) {
        return createGriddleSelector(
        this,
        this.pageSizeSelector,
        this.dataSelector,
        (pageSize, data) => {
          const total = data.size;
          const calc = total / pageSize;

          return calc > Math.floor(calc) ? Math.floor(calc) + 1 : Math.floor(calc);
        }
      )(state, props)
    },

    //gets the column property objects ordered by order
    sortedColumnPropertiesSelector: function(state, props) {
      return createGriddleSelector(
        this,
        this.renderPropertiesSelector,
        (renderProperties) => (
          renderProperties && renderProperties.get('columnProperties') && renderProperties.get('columnProperties').size !== 0 ?
            renderProperties.get('columnProperties')
              .sortBy(col => (col && col.get('order'))||MAX_SAFE_INTEGER) :
            null
        )
      )(state, props);
    },

    //gets the visible columns
    visibleColumnsSelector: function (state, props) {
      return createGriddleSelector(
        this,
        this.sortedColumnPropertiesSelector,
        this.allColumnsSelector,
        (sortedColumnProperties, allColumns) => (
          sortedColumnProperties ? sortedColumnProperties
            .keySeq()
            .toJSON() :
          allColumns
        )
      )(state, props)
    },

    //is there a next page
    hasNextSelector: function(state, props) {
      return createGriddleSelector(
        this,
        this.currentPageSelector.bind(this),
        this.maxPageSelector.bind(this),
        (currentPage, maxPage) => (currentPage < maxPage)
      )(state, props)
    },

    //is there a previous page?
    hasPreviousSelector: state => (state.getIn(['pageProperties', 'currentPage']) > 1),

    //get the filtered data
    filteredDataSelector: function(state, props) {
      return createGriddleSelector(
        this,
        this.dataSelector,
        this.filterSelector,
        (data, filter) => {
          return data.filter(row  => {
            return Object.keys(row.toJSON())
              .some(key => {
                return row.get(key) && row.get(key).toString().toLowerCase().indexOf(filter.toLowerCase()) > -1
              })
            })
        }
      )(state, props)
    },

    sortedDataSelector: function(state, props) {
      return createGriddleSelector(
        this,
        this.filteredDataSelector,
        this.sortColumnsSelector,
        this.sortColumnsShouldSortAscendingSelector,
        this.renderPropertiesSelector,
        (filteredData, sortColumns, sortColumnsShouldSortAscending, renderProperties) => {
          const sortType = renderProperties && renderProperties.get('columnProperties')
          return utils.getSortedData(filteredData, sortColumns, sortColumnsShouldSortAscending.first())
        }
      )(state, props)
    },

    currentPageDataSelector: function(state, props) {
      return createGriddleSelector(
        this,
        this.sortedDataSelector,
        this.pageSizeSelector,
        this.currentPageSelector,
        (sortedData, pageSize, currentPage) => {
          return sortedData
            .skip(pageSize * (currentPage - 1))
            .take(pageSize);
        }
      )(state, props)
    },

    //get the visible data (and only the columns that are visible)
    visibleDataSelector: function(state, props) {
      return createGriddleSelector(
        this,
        this.currentPageDataSelector,
        this.visibleColumnsSelector,
        (currentPageData, visibleColumns) => getVisibleDataColumns(currentPageData, visibleColumns)
      )(state, props)
    },

    hiddenColumnsSelector: function(state, props) {
      return createGriddleSelector(
        this,
        this.visibleColumnsSelector,
        this.allColumnsSelector,
        this.metaDataColumnsSelector,
        (visibleColumns, allColumns, metaDataColumns) => {
          const removeColumns = [...visibleColumns, ...metaDataColumns];

          return allColumns.filter(c => removeColumns.indexOf(c) === -1);
        }
      )(state, props)
    },

    renderableColumnsSelector: function(state, props) {
      return createGriddleSelector(
        this,
        this.visibleColumnsSelector,
        this.hiddenColumnsSelector,
        (visibleColumns, hiddenColumns) => [...visibleColumns, ...hiddenColumns]
      )(state, props)
    },

    //TODO: this needs some tests
    hiddenDataSelector: function(state, props) {
      return createGriddleSelector(
        this,
        this.currentPageDataSelector,
        this.visibleColumnsSelector,
        this.allColumnsSelector,
        this.metaDataColumnsSelector,
        (currentPageData, visibleColumns, allColumns, metaDataColumns) => {
          return getDataForColumns(currentPageData, keys)
        }
      )(state, props)
    },

    //TODO: this needs some tests
    metaDataSelector: function(state, props) {
      return createGriddleSelector(
        this,
        this.currentPageDataSelector,
        this.metaDataColumnsSelector,
        (currentPageData, metaDataColumns) => { return getDataForColumns(currentPageData, metaDataColumns) }
      )(state, props)
    },

    //TODO: This NEEDS tests
    columnTitlesSelector: function(state, props) {
      return createGriddleSelector(
        this,
        this.visibleDataSelector,
        this.metaDataSelector,
        this.renderPropertiesSelector,
        (visibleData, metaData, renderProperties) => {
          if(visibleData.size > 0) {
            return Object.keys(visibleData.get(0).toJSON()).map(k =>
              renderProperties.get('columnProperties').get(k).get('displayName') || k
            )
          }

          return [];
        }
      )(state, props)
    },

    griddleStateSelector: function(state, props) {
      return createGriddleSelector(
        this,
        this.visibleDataSelector,
        this.metaDataSelector,
        this.currentPageDataSelector,
        this.renderPropertiesSelector,
        this.columnTitlesSelector,
        this.allColumnsSelector,
        this.renderableColumnsSelector,
        (visibleData, metaData, currentPageData, renderProperties, columnTitles, allColumns, renderableColumns) => ({
          visibleData,
          metaData,
          currentPageData,
          renderProperties,
          columnTitles,
          allColumns,
          renderableColumns
        })
      )(state, props)
    },
  }
}
