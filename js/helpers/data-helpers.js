import MAX_SAFE_INTEGER from 'max-safe-integer';
import Immutable from 'immutable';
import extend from 'lodash.assign';
export function getVisibleData(state) {
  const data =  state.get('data');

  const columns = getDataColumns(state, data);
  return getVisibleDataColumns(getSortedColumns(data, columns), columns);
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

//From Immutable docs - https://github.com/facebook/immutable-js/wiki/Predicates
function keyInArray(keys) {
  var keySet = Immutable.Set(keys);
  return function (v, k) {

    return keySet.has(k);
  }
}

export function getVisibleDataColumns(data, columns) {
  if (data.size < 1) {
    return data;
  }

  const dataColumns = data.get(0).keySeq().toArray();
  const metadataColumns = dataColumns.filter(item => columns.indexOf(item) < 0);

  //if columns are specified but aren't in the data
  //make it up (as null). We will append this column
  //to the resultant data
  const magicColumns = columns
    .filter(item => dataColumns.indexOf(item) < 0)
    .reduce((original, item) => { original[item] = null; return original}, {})

  //combine the metadata and the "magic" columns
  const extra = data.map((d, i) => new Immutable.Map(
    extend(magicColumns, {__metadata: d.filter(keyInArray(metadataColumns)).set('index', i)})
  ));

  const result = data.map(d => d.filter(keyInArray(columns)));

  return result.mergeDeep(extra);
}

export function getDataColumns(state, data) {
  const renderProperties = state.get('renderProperties');
  if(renderProperties && renderProperties.get('columnProperties') && renderProperties.get('columnProperties').size !== 0) {
    const keys = state
      .getIn(['renderProperties', 'columnProperties'])
      .sortBy(col => col.get('order')||MAX_SAFE_INTEGER)
      .keySeq()
      .toJSON();

    return keys;
  }

  return getAllPossibleColumns(state).toJSON();
}
