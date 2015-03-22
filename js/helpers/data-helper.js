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

  filterByOneColumn: function(filter, data){
    //TODO:
  }
}

module.exports = DataHelper; 