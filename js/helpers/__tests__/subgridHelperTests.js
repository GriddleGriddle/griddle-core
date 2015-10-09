import Immutable from 'immutable';

import { getSortedColumns } from '../subgrid-helpers';

describe('subgridHelpers', () => {
  it('sorts child columns', () => {
    const data = Immutable.fromJS([
      { name: 'Trance', type: 'Electronic', bpm: '130', children: [
        { name: 'Progressive', type: 'Electronic', bpm: '128' },
        { name: 'Epic', type: 'Electronic', bpm: '134' },
        { name: 'Psy', type: 'Electronic', bpm: '140' }
      ]},
     { name: 'House', type: 'Electronic', bpm: '125', children: [
        { name: 'Chill', type: 'Electronic', bpm: '128' },
        { name: 'Deep', type: 'Electronic', bpm: '124' },
        { name: 'Tech', type: 'Electronic', bpm: '134' }
      ]}
    ]);

    const columns = ['bpm', 'name', 'type', 'children'];
    const sortedColumns = getSortedColumns(data, columns, 'children');

    expect(Object.keys(sortedColumns.get(0).toJSON())).toEqual(columns);
    expect(Object.keys(sortedColumns.get(0).get('children').get(0).toJSON())).toEqual(columns);
  });
});
