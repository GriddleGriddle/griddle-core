import Immutable from 'immutable';
import MAX_SAFE_INTEGER from 'max-safe-integer';
import { getVisibleDataColumns, getDataForColumns } from '../utils/dataUtils'
import { createGriddleSelector } from '../utils/selectorUtils';

export default function(utils) {
  return {
    //gets the full dataset currently tracked by griddle
    dataSelector: state => state.get('data'),

    //gets the number of records to display
    pageSizeSelector: state => state.getIn(['pageProperties', 'pageSize']),

    //what's the current page
    currentPageSelector: state => state.getIn(['pageProperties', 'currentPage']),

    //max page number
    maxPageSelector: state => state.getIn(['pageProperties', 'maxPage']),

    //what's the current selector
    filterSelector: state => state.get('filter') || '',

    //gets the current sort columns
    sortColumnsSelector: state => (state.get('sortColumns')||[]),

    //gets the current sort direction (this is an array that corresponds to columns) records are true if sortAscending
    sortColumnsShouldSortAscendingSelector: state => (state.get('sortDirections') || []),

    //the properties that determine how things are rendered
    renderPropertiesSelector: state => state.get('renderProperties'),

    allColumnsSelector: function(state, props) {
      return createGriddleSelector(
        this,
        this.dataSelector,
        (data) => (data.size === 0 ? [] : data.get(0).keySeq().toJSON())
      )(state, props)
    },

    //gets the metadata columns or nothing
    metaDataColumnsSelector: state => (state.get('metadataColumns') || []),

    //is there a next page
    hasNextSelector: function(state, props) {
      return createGriddleSelector(
        this,
        this.currentPageSelector,
        this.maxPageSelector,
        (currentPage, maxPage) => (maxPage > currentPage)
      )(state, props);
    },

    //is there a previous page?
    hasPreviousSelector: state => (state.getIn(['pageProperties', 'currentPage']) > 1),

    metaDataSelector: state => state.get('metaData'),

    columnTitlesSelector: function(state, props) {
      return createGriddleSelector(
        this,
        this.dataSelector,
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
      );
    },

    griddleStateSelector: function(state, props) {
      return createSelector(
        this,
        this.dataSelector,
        this.metaDataSelector,
        this.renderPropertiesSelector,
        this.columnTitlesSelector,
        this.allColumnsSelector,
        (visibleData, metaData, currentPageData, renderProperties, columnTitles, allColumns, renderableColumns) => ({
          visibleData,
          metaData,
          currentPageData,
          renderProperties,
          columnTitles,
          allColumns,
        })
      )
    }
  }
}
