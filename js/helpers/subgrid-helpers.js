export function getSortedColumns(data, columns, childrenPropertyName) {
  return data.map((row, index) => {
    let children = row.get(childrenPropertyName || 'children');

    if(children && children.size > 0) {
      children = getSortedColumns(row.get('children'), columns);
    }

    return row
      .sortBy((val, key) => columns.indexOf(key))
      .set('children', children)
  });
}