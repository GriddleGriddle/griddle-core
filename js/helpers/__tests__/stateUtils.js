import Immutable from 'immutable';

export function getBasicState() {
  return Immutable.fromJS({
    data: [
      { one: 'one', two: 'two' },
      { one: 'three', two: 'four' }
    ],
    renderProperties: {
      columnProperties: {
        one: { id: 'one', displayName: 'One', order: 2 },
        two: { id: 'two', displayName: 'Two', order: 1 }
      }
    },
    pageProperties: {
      property1: 'one',
      property2: 'two',
      pageSize: 1,
      currentPage: 0,
      maxPage: 2
    }
  });
}

