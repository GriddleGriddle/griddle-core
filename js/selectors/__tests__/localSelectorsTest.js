import Immutable from 'immutable';
import * as selectors from '../localSelectors';
import sortUtils from '../../utils/sortUtils';

//TODO: this needs to go away
selectors.registerUtils(sortUtils)


function getBasicState() {
  return Immutable.fromJS({
    data: [
      { one: 'one', two: 'two' },
      { one: 'three', two: 'four' }
    ],
    pageProperties: {
      property1: 'one',
      property2: 'two',
      pageSize: 1,
      currentPage: 0,
      maxPage: 2
    }
  });
}

function withRenderProperties(state) {
  return state.set('renderProperties', new Immutable.fromJS({
      columnProperties: {
        one: { id: 'one', displayName: 'One', order: 2 },
        two: { id: 'two', displayName: 'Two', order: 1 }
      }
    })
  )
}

export function get3ColState() {
  return Immutable.fromJS({
    data: [
      { one: 'one', two: 'two', three: 'three' },
      { one: 'four', two: 'five', three: 'six' }
    ],
    pageProperties: {
      property1: 'one',
      property2: 'two',
      pageSize: 1,
      currentPage: 0,
      maxPage: 2
    }
  });
}

describe('localSelectors', () => {
  var initialState;

  beforeEach(() => {
    initialState = new Immutable.Map();
  })

  it('gets data', () => {
    const state = initialState.set('data', 'hi');
    expect(selectors.dataSelector(state)).toEqual('hi');
  })

  it('gets pageSize', () => {
    const state = initialState.setIn(['pageProperties', 'pageSize'], 20);
    expect(selectors.pageSizeSelector(state)).toEqual(20);
  })

  describe('hasNextSelector', () => {
    it('gets true when there are more possible pages', () => {
      const state = getBasicState()
        .setIn(['pageProperties', 'currentPage'], 1);

      expect(selectors.hasNextSelector(state)).toEqual(true);
    })

    it('gets false when no more possible pages', () => {
      const state = getBasicState()
        .setIn(['pageProperties', 'currentPage'], 5)

      expect(selectors.hasNextSelector(state)).toEqual(false);
    })
  })

  describe('hasPreviousSelector', () => {
    it('gets true when there are previous pages', () => {
      const state = initialState
        .setIn(['pageProperties', 'currentPage'], 5);

      expect(selectors.hasPreviousSelector(state)).toEqual(true);
    })

    it('gets false when no previous pages', () => {
      const state = initialState
        .setIn(['pageProperties', 'currentPage'], 1);

      expect(selectors.hasPreviousSelector(state)).toEqual(false);
    })
  })

  it('gets current page', () => {
    const state = initialState.setIn(['pageProperties', 'currentPage'], 5);
    expect(selectors.currentPageSelector(state)).toEqual(5);
  });

  it('gets max page', () => {
    const state = getBasicState();
    expect(selectors.maxPageSelector(state)).toEqual(2);
  })

  it('gets filter', () => {
    const state = initialState.set('filter', 'filtered');
    expect(selectors.filterSelector(state)).toEqual('filtered');
  });

  it('gets empty string when no filter present', () => {
    const state = initialState;
    expect(selectors.filterSelector(state)).toEqual('');
  })

  describe('filteredDataSelector', () => {
    it('gets filtered data', () => {
      const state = getBasicState()
        .set('filter', 'four');

      const filteredData = selectors.filteredDataSelector(state);

      expect(filteredData.size).toEqual(1);
      expect(filteredData.toJSON()).toEqual([{one: 'three', two: 'four'}]);
    })

    it('gets the entire dataset when no filter is present', () => {
      const state = getBasicState();
      const filteredData = selectors.filteredDataSelector(state);

      expect(filteredData.size).toEqual(2);
      expect(filteredData.toJSON()).toEqual(state.get('data').toJSON());
    })
  })

  describe('visible columns', () => {
    it('gets the renderProperties', () => {
      const state = withRenderProperties(getBasicState());

      const renderProperties = selectors.renderPropertiesSelector(state);
      expect(renderProperties.toJSON()).toEqual({
        columnProperties: {
          one: { id: 'one', displayName: 'One', order: 2 },
          two: { id: 'two', displayName: 'Two', order: 1 }
        }
      });
    })

    it('gets sorted columns', () => {
      const state = withRenderProperties(getBasicState());
      const sortedColumnSettings = selectors.sortedColumnPropertiesSelector(state);

      expect(sortedColumnSettings.toJSON()).toEqual({
        two: { id: 'two', displayName: 'Two', order: 1 },
        one: { id: 'one', displayName: 'One', order: 2 }
      });
    })

    it('gets the correct order for magic columns when no order specified', () => {
       const state = getBasicState()
         .set('renderProperties', new Immutable.fromJS({
           columnProperties: {
             one: { id: 'one', displayName: 'One' },
             onepointfive:  { id: 'onepointfive' },
             two: { id: 'two', displayName: 'Two' }
           }
         }))

      const sortedSettings = selectors.sortedColumnPropertiesSelector(state);
      expect(Object.keys(sortedSettings.toJSON())).toEqual(['one', 'onepointfive', 'two']);
    })

    it('gets the correct order for magic columns when order specified', () => {
       const state = getBasicState()
         .set('renderProperties', new Immutable.fromJS({
           columnProperties: {
             one: { id: 'one', displayName: 'One', order: 3 },
             onepointfive:  { id: 'onepointfive', order: 1 },
             two: { id: 'two', displayName: 'Two', order: 2 }
           }
         }))

      const sortedSettings = selectors.sortedColumnPropertiesSelector(state);
      expect(Object.keys(sortedSettings.toJSON())).toEqual(['onepointfive', 'two', 'one']);
    })

    it('gets sorted data', () => {
      const state = withRenderProperties(getBasicState())
        .set('sortColumns', ['two'])
        .set('sortAscending', [true]);

      const sortedData = selectors.sortedDataSelector(state);

      expect(sortedData.toJSON()).toEqual([{one: 'three', two: 'four'}, {one: 'one', two: 'two'}]);
    })

    it('gets all columns', () => {
      const state = getBasicState();

      const allColumns = selectors.allColumnsSelector(state);
      expect(allColumns).toEqual(['one', 'two']);
    })

    it('gets visible columns', () => {
      const state = withRenderProperties(get3ColState());

      const visibleColumns = selectors.visibleColumnsSelector(state);
      expect(visibleColumns).toEqual(['two', 'one']);
    });

    it('gets all columns when no columns specified', () => {
      const state = get3ColState();

      const visibleColumns = selectors.visibleColumnsSelector(state);
      expect(visibleColumns).toEqual(['one', 'two', 'three'])
    })
  })

  describe('current data page', () => {
     it ('gets current data', () => {
      const state = get3ColState();

      const data = selectors.currentPageDataSelector(state);
      expect(data.toJSON()).toEqual([{one: 'one', two: 'two', three: 'three'}]);
    })
  })

  describe('visible data', () => {
    it ('gets columns in the right order', () => {
      const state = withRenderProperties(get3ColState());
      const data = selectors.visibleDataSelector(state);
      expect(Object.keys(data.toJSON()[0])).toEqual(['two', 'one'])
    })

    it('gets magic columns', () => {
      const state = withRenderProperties(getBasicState())
        .mergeDeepIn(['renderProperties', 'columnProperties'], { onepointfive: null });


      const data = selectors.visibleDataSelector(state);

      expect(data.toJSON()).toEqual([
        {two: 'two', onepointfive: null,  one: 'one'},
      ]);
    })

  })
})
