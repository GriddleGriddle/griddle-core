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
      .setIn(['sortProperties', 'sortColumns'], '[]')
      .setIn(['sortProperties', 'sortAscending'], 'true')
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
        return(LocalDataPlugin
          .getPage(state, action.pageNumber));
      },

      GRIDDLE_NEXT_PAGE(action, state) {
        return(LocalDataPlugin
          .getPage(state,
          state.getIn(['pageProperties', 'currentPage']) + 1));
      },

      GRIDDLE_PREVIOUS_PAGE(action, state) {
        return(LocalDataPlugin
            .getPage(state,
            state.getIn(['pageProperties', 'currentPage']) - 1));
      },

      GRIDDLE_FILTERED(action, state) {
        if(action.filter === "") {
        return state
          .set('filteredData', Immutable.fromJS([]))
          .setIn(['pageProperties', 'currentPage'], 1)
          .setIn(
            ['pageProperties', 'maxPage'],
            LocalDataPlugin.getPageCount(
              //use getDataSet to make sure we're not getting rid of sort/etc
              LocalDataPlugin.getDataSet(state).length,
              state.getIn(['pageProperties', 'pageSize'])))
          .set('filter', '');
        }

        return LocalDataPlugin.filter(state, action.filter);
      },

      //TODO: This is a really simple sort, for now
      //      We need to add sort type and different sort operations
      GRIDDLE_SORT(action, state) {
        if(!action.sortColumns || action.sortColumns.length < 1) { return state }

        return LocalDataPlugin.sortByColumns(state, action.sortColumns)
      }
    }
  }

  get Helpers() {
    return {
      getVisibleData() {
        //get the max page / current page and the current page of data
        const pageSize = this.state.getIn(['pageProperties', 'pageSize']);
        const currentPage = this.state.getIn(['pageProperties', 'currentPage']);
        return LocalDataPlugin.getDataSet(this.state)
          .skip(pageSize * (currentPage-1)).take(pageSize);
      },

      hasNext() {
        return this.state.getIn(['pageProperties', 'currentPage']) <
          this.state.getIn(['pageProperties', 'maxPage']);
      },

      hasPrevious() {
        return this.state.getIn(['pageProperties', 'currentPage']) > 1;
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

  static filter(state, filter) {
    //TODO: We need to support filtering by specific columns
    var filtered = state.get('data')
      .filter(row  => {
        return Object.keys(row.toJSON())
          .some(key => {
            return row.get(key).toString().toLowerCase().indexOf(filter.toLowerCase()) > -1
          })
        })

    return state
      .set('filteredData', filtered)
      .set('filter', filter)
      .setIn(['pageProperties', 'currentPage'], 1)
      .setIn(
        ['pageProperties', 'maxPage'],
        LocalDataPlugin.getPageCount(
          LocalDataPlugin.getDataSet(state).length,
          state.getIn(['pageProperties', 'pageSize'])));
  }

  static sortByColumns(state, columns, sortAscending=true) {
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
      sorted = LocalDataPlugin.filter(sorted, sorted.get('filter'));
    }

    return sorted;
  }

  static getPage(state, pageNumber) {
    const maxPage = LocalDataPlugin.getPageCount(
      LocalDataPlugin.getDataSet(state).length,
      state.getIn(['pageProperties', 'pageSize']));

    if(pageNumber >= 1 && pageNumber <= maxPage) {
      return state
        .setIn(['pageProperties', 'currentPage'], pageNumber)
        .setIn(['pageProperties', 'maxPage'], maxPage);
    }

    return state;
  }
}

export default LocalDataPlugin;
