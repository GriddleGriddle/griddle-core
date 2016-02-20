import Immutable from 'immutable';
import sortUtils from '../sortUtils';

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

fdescribe('SortUtils', () => {
  it('sorts the data', () => {
    const state = getBasicState();
    const sortedData = sortUtils.getSortedData(state.get('data'), ['two'], true);

    expect(sortedData.toJSON()).toEqual([{one: 'three', two: 'four'}, {one: 'one', two: 'two'}]);
  });

  it('sorts the data in reverse when ascending is false', () => {
    const state = getBasicState();
    const sortedData = sortUtils.getSortedData(state.get('data'), ['two'], false);

    expect(sortedData.toJSON()).toEqual([{one: 'one', two: 'two'}, {one: 'three', two: 'four'}]);
  })

  it('sorts by date', () => {
    const state = getBasicState()
      .set('data', Immutable.fromJS([
        {one: '1/1/1900', two: '1/5/2016'},
        {one: '7/20/1982', two: '8/21/2015'}]))
      .setIn(
        ['renderProperties', 'columnProperties', 'two'],
        new Immutable.Map({ sortType: 'date', id: 'two', displayName: 'Two'}))

    const sortedData = sortUtils.getSortedData(state.get('data'), ['two'], true, 'date');

    expect(sortedData.toJSON())
      .toEqual([{one: '7/20/1982', two: '8/21/2015'}, {one: '1/1/1900', two: '1/5/2016'}]);
  })

  it('sorts by date descending', () => {
    const state = getBasicState()
      .set('data', Immutable.fromJS([
        {one: '1/1/1900', two: '1/5/2016'},
        {one: '7/20/1982', two: '8/21/2015'}]))

      .setIn(
        ['renderProperties', 'columnProperties', 'two'],
        new Immutable.Map({ sortType: 'date', id: 'two', displayName: 'Two'}))

    const sortedData = sortUtils.getSortedData(state.get('data'), ['two'], false, 'date');

    expect(sortedData.toJSON())
      .toEqual([{one: '1/1/1900', two: '1/5/2016'}, {one: '7/20/1982', two: '8/21/2015'}]);
  })

  it('works with custom sort types', () => {
    const state = getBasicState();

    const newSort = (data, column, sortAscending = true) => {
      return data.sort(
        (original, newRecord) => {
          original = (!!original.get(column) && original.get(column)) || "";
          newRecord = (!!newRecord.get(column) && newRecord.get(column)) || "";

          if(original[1] === newRecord[1]) {
            return 0;
          } else if (original[1] > newRecord[1]) {
            return sortAscending ? 1 : -1;
          }
          else {
            return sortAscending ? -1 : 1;
          }
        })
    }

    const newSortTypes = Object.assign({}, sortUtils.sortTypes, {secondLetter: newSort });
    const newSortUtils = Object.assign({}, sortUtils, { sortTypes: newSortTypes });

    const sortedData = newSortUtils.getSortedData(state.get('data'), ['one'], true, 'secondLetter');
    console.log(sortedData.toJSON());
    //TODO: Finish this test -- basically want to make sure that the data is getting sorted
    //by the second letter
  })
})
