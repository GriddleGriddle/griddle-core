import StoreBoilerplate from './store-boilerplate';
import Immutable from 'immutable';

class LocalDataPlugin extends StoreBoilerplate {
  constructor(state){
    super();
  }

  initializeState(state) {
    //default state modifications for this plugin
    return state
      .setIn(['pageProperties', 'pageSize'], 10)
      .setIn(['pageProperties', 'currentPage'], 1)
      .set('filter', '')
      .set('filteredData', Immutable.fromJS([]));

  }
  get RegisteredCallbacks() {
    return {
      GRIDDLE_LOADED_DATA(action, state) {
        //set state's data to this
        return state
          .set('data', Immutable.fromJS(action.data))
          .setIn(
            ['pageProperties', 'maxPage'],
            LocalDataPlugin.getPageCount(
              action.data.length,
              state.getIn(['pageProperties', 'pageSize'])));
      },

      GRIDDLE_SET_PAGE_SIZE(action, state) {
        return state
          .setIn(['pageProperties', 'pageSize'], action.pageSize);
      },

      GRIDDLE_GET_PAGE(action, state) {
        if(action.pageNumber >= 1 && action.pageNumber <= state.getIn(['pageProperties', 'maxPage'])) {
          return state.setIn(['pageProperties', 'currentPage'], action.pageNumber);
        }

        return state;
      },

      GRIDDLE_NEXT_PAGE(action, state) {
        const currentPage = state.getIn(['pageProperties', 'currentPage']);
        const maxPage = state.getIn(['pageProperties', 'maxPage']);

        if(currentPage < maxPage){
          return state.setIn(
            ['pageProperties', 'currentPage'],
            state.getIn(['pageProperties', 'currentPage']) + 1)
        }

        return state;
      },

      GRIDDLE_PREVIOUS_PAGE(action, state) {
        const currentPage = state.getIn(['pageProperties', 'currentPage']);

        if(currentPage > 1){
          return state.setIn(
            ['pageProperties', 'currentPage'],
            state.getIn(['pageProperties', 'currentPage']) - 1)
        }

        return state;
      },

      GRIDDLE_FILTERED(action, state) {
        if(action.filter === "") {
        return state
          .set('filteredData', Immutable.fromJS([]))
          .setIn(
            ['pageProperties', 'maxPage'],
            LocalDataPlugin.getPageCount(
              state.get('data').length,
              state.getIn(['pageProperties', 'pageSize'])))
          .set('filter', '');
        }

        var filtered = state.get('data')
          .filter(row  => {
            return Object.keys(row.toJSON())
              .some(key => {
                return row.get(key).toString().toLowerCase().indexOf(action.filter.toLowerCase()) > -1
              })
            })

        return state
          .set('filteredData', filtered)
          .set('filter', action.filter)
          .setIn(
            ['pageProperties', 'maxPage'],
            LocalDataPlugin.getPageCount(
              filtered.length,
              state.getIn(['pageProperties', 'pageSize'])));
      },
    }
  }

  get PrePatches() {
    return;
  }

  get PostPatches() {
    return;
  }

  get Helpers() {
    return {
      getVisibleData() {
        //oldskool
        let _this = this;

        //get the max page / current page and the current page of data
        const pageSize = this.state.getIn(['pageProperties', 'pageSize']);
        const currentPage = this.state.getIn(['pageProperties', 'currentPage']);
        return LocalDataPlugin.getDataSet(this.state)
          .skip(pageSize * (currentPage-1)).take(pageSize);
      }
    }
  }


  //static helper methods
  static getPageCount(total, pageSize) {
    const calc = total / pageSize;
    return calc > Math.floor(calc) ? Math.floor(calc) + 1 : Math.floor(calc);
  }

  static getDataSet(state) {
    if(!!state.get('filter')){
      return state.get('filteredData');
    }

    return state.get('data');
  }
}

export default LocalDataPlugin;
