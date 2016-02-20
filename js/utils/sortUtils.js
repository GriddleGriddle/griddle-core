function defaultSort(data, column, sortAscending = true) {
  return data.sort(
    (original, newRecord) => {
      original = (!!original.get(column) && original.get(column)) || "";
      newRecord = (!!newRecord.get(column) && newRecord.get(column)) || "";

      //TODO: This is about the most cheezy sorting check ever.
      //Make it be able to sort for dates / monetary / regex / whatever
      if(original === newRecord) {
        return 0;
      } else if (original > newRecord) {
        return sortAscending ? 1 : -1;
      }
      else {
        return sortAscending ? -1 : 1;
      }
    });
}

function dateSort(data, column, sortAscending = true) {
  return data.sort(
    (original, newRecord) => {
      original = (!!original.get(column) && new Date(original.get(column))) || null;
      newRecord = (!!newRecord.get(column) && new Date(newRecord.get(column))) || null;
      if(original.getTime() === newRecord.getTime()) {
        return 0;
      } else if (original > newRecord) {
        return sortAscending ?  1 : -1;
      } else {
        return sortAscending ? -1 : 1;
      }
    })
}

export default {
  getSortedData: function(data, columns, sortAscending = true, sortType = 'default') {
    return this.getSortByType(sortType)(data, columns[0], sortAscending)
  },

  getSortByType: function(type) {
    const sortType = this.sortTypes;
    return sortType.hasOwnProperty(type) ? sortType[type] : defaultSort
  },
  sortTypes: {
    "default": defaultSort,
    "date": dateSort,
  }
}
