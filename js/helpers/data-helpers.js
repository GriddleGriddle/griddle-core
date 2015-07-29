import MAX_SAFE_INTEGER from 'max-safe-integer';

export function getVisibleData(state = this.state) {
  const data =  state.get('data');
  return getDataColumns(state, data);
}

export function updateVisibleData(state) {
  return state
    .set('visibleData', getVisibleData(state));
}

export function getState(state = this.state) {
  return state;
}

export function getPageProperties(state = this.state) {

  return state.get('pageProperties');
}

export function getPageCount(total, pageSize) {
  const calc = total / pageSize;
  return calc > Math.floor(calc) ? Math.floor(calc) + 1 : Math.floor(calc);
}

export function getColumnTitles(state = this.state) {
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

export function getColumnProperties(state = this.state) {
  if(state.get('renderProperties') && state.get('renderProperties').get('columnProperties').size !== 0) {
    return state
      .get('renderProperties')
      .get('columnProperties').toJSON();
  }

  return {};
}

export function getVisibleColumns(state = this.state) {
  if(this.state.get('data').size === 0) {
    return new Immutable.fromJS([]);
  }
}

export function getAllPossibleColumns(state = this.state) {
  if(this.state.get('data').size === 0) {
    return new Immutable.fromJS([]);
  }

  return this.state.get('data').get(0).keySeq();
}

//TODO: consider moving state after data so that we can assign state = this.state by default
export function getDataColumns(state, data) {
  if(state.get('renderProperties') && state.get('renderProperties').get('columnProperties').size !== 0) {
    const keys = state
      .get('renderProperties')
      .get('columnProperties')
      .sortBy(col => col.get('order')||MAX_SAFE_INTEGER)
      .keySeq()
      .toJSON();

    return data
      .map(item => item
        .filter((val, key) => keys.indexOf(key) > -1 )
        .sortBy((val, key) => keys.indexOf(key))
      );
  }

  return data;
}