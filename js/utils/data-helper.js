var DataHelper = {
  filterAllData: function(filter, data){
    return _.filter(data, function(record){
      var items = _.values(record);
      //go through all the values (columns) in the record and see if it matches the filter
      for(var i = 0; i < items.length; i++){
         if ((items[i]||"").toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0){
          return true;
         }
      }

      return false;
    });
  },

  filterByOneColumn: function(filter, data, column){
    //TODO:
  },

  sort: function(sortColumns, data, ascending){
    if (sortColumns.length < 1) { return data };

    var returnData = _.sortByAll(data, sortColumns);

    return ascending ? returnData : reverseSort(returnData);
  },

  reverseSort: function(data){
    //abstracting this here for a future date.
    data.reverse();
  },

  getMaxPageSize: function(dataLength, pageSize){
    var calc = dataLength / pageSize;
    return calc > Math.floor(calc) ? Math.floor(calc) + 1 : Math.floor(calc);
  }
}

module.exports = DataHelper;
