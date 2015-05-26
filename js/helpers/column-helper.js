'use strict';

const ColumnHelper = {
  isColumnVisible(columnProperties, column) {
    if(!columnProperties) { return true}

    return ((columnProperties.hasOwnProperty(column) && !columnProperties[column].hidden) ||
    Object.getOwnPropertyNames(columnProperties).length === 0);
  },

  getColumnProperty(columnProperties, column) {
    if(!columnProperties) { return null; }
    return columnProperties.hasOwnProperty(column) ? columnProperties[column] : null;
  }
};

export default ColumnHelper;
