import MAX_SAFE_INTEGER from 'max-safe-integer';

export function getVisibleData(state) {
  const data =  state.get('data');

  const columns = getDataColumns(state, data);
  return getSortedColumns(data, columns);
}

export function updateVisibleData(state) {
  return state
    .set('visibleData', getVisibleData(state));
}

//why? Assuming this is carry-over from old flux?
export function getState(state) {
  return state;
}

export function getPageProperties(state) {

  return state.get('pageProperties');
}

export function addKeyToRows(data) {
  let key = 0;
  const getKey = (() => key++);

  return data.map(row => row.set('griddleKey', getKey()));
}

export function getPageCount(total, pageSize) {
  const calc = total / pageSize;
  return calc > Math.floor(calc) ? Math.floor(calc) + 1 : Math.floor(calc);
}

export function getColumnTitles(state) {
  if(state.get('renderProperties') && state.get('renderProperties').get('columnProperties').size !== 0) {
    return state
      .get('renderProperties')
      .get('columnProperties')
      .filter(column => !!column.get('displayName'))
      .map(column => {
        let col = {};
        col[column.get('id')] = column.get('displayName');
        return col;
      }).toJSON();
  }

  return {};
}

export function getColumnProperties(state) {
  if(state.get('renderProperties') && state.get('renderProperties').get('columnProperties') && state.get('renderProperties').get('columnProperties').size !== 0) {
    return state
      .get('renderProperties')
      .get('columnProperties').toJSON();
  }

  return {};
}

//TODO: Determine if this should stay here
export function getAllPossibleColumns(state) {
  if(state.get('data').size === 0) {
    return new Immutable.fromJS([]);
  }

  return state.get('data').get(0).keySeq();
}

export function getSortedColumns(data, columns) {
  return data
    .map(item => item.sortBy((val, key) => columns.indexOf(key)));
}

export function getDataColumns(state, data) {
  if(state.get('renderProperties') && state.get('renderProperties').get('columnProperties').size !== 0) {
    const keys = state
      .get('renderProperties')
      .get('columnProperties')
      .sortBy(col => col.get('order')||MAX_SAFE_INTEGER)
      .keySeq()
      .toJSON();

    return keys;
  }

  return [];
}
