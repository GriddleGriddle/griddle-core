import Immutable from 'immutable';
import { createSelector } from 'reselect';

export const dataSelector = state => state.get('data');
export const pageSizeSelector = state => state.getIn(['pageProperties', 'pageSize']);
export const hasPreviousSelector = state => (state.getIn(['pageProperties', 'currentPage']) > 1);
export const currentPageSelector = state => state.getIn(['pageProperties', 'currentPage']);
export const maxPageSelector = state => state.getIn(['pageProperties', 'maxPage']);
export const filterSelector = state => state.get('filter')||'';

export const hasNextSelector = createSelector(
  currentPageSelector,
  maxPageSelector,
  (currentPage, maxPage) => (currentPage < maxPage)
);

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


