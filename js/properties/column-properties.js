var _ = require('lodash');

class ColumnProperties{
  constructor (columnMetadata = {}, horizontalOffset, tableWidth){
    this.columnMetadata = columnMetadata;

    this.initialDisplayIndex = 0;
    this.lastDisplayIndex = 0;
    this.leftHiddenColumnWidth = 0;
    this.rightHiddenColumnWidth = 0;

    var metadataKeys = Object.keys(columnMetadata);

    this.maxColumnLength = metadataKeys.length;

    if (metadataKeys.length > 0){
      // Determine the first column visible
      for(var i = 0; i < this.maxColumnLength; i++){
        var offset = this.leftHiddenColumnWidth + columnMetadata[metadataKeys[i]].columnWidth;

        if (offset >= horizontalOffset){
          this.initialDisplayIndex = i;
          break;
        } else {
          this.leftHiddenColumnWidth = offset;
        }
      }

      // Subtract by one to allow give ourselves a buffer.
      this.initialDisplayIndex = this.initialDisplayIndex - 1;

      // If the index is less than zero, set to zero.
      if (this.initialDisplayIndex < 0) {
        this.initialDisplayIndex = 0;
        this.leftHiddenColumnWidth = 0;
      } else {
        this.leftHiddenColumnWidth -= columnMetadata[metadataKeys[this.initialDisplayIndex]].columnWidth;
      }

      // Determine the last column visible
      var tableOffset = 0;
      for(var i = this.initialDisplayIndex; i < this.maxColumnLength; i++){
        var offset = tableOffset + columnMetadata[metadataKeys[i]].columnWidth;

        if (offset >= tableWidth || i === this.maxColumnLength - 1){
          this.lastDisplayIndex = i;
          break;
        } else {
          tableOffset = offset;
        }
      }

      // Add two to give ourselves a buffer.
      this.lastDisplayIndex = this.lastDisplayIndex + 2;

      // If there aren't enough available columns, set to the max length of properties.
      if (this.lastDisplayIndex > this.maxColumnLength - 1){
        this.lastDisplayIndex = this.maxColumnLength - 1;
      }

      // Compute the width of columns after what's shown.
      for(var i = this.lastDisplayIndex; i < this.maxColumnLength - 1; i++){
        this.rightHiddenColumnWidth += columnMetadata[metadataKeys[i]].columnWidth;
      }
    }
  }

  getColumnMetadata(){
    return this.columnMetadata;
  }

  getWidthForColumn(column){
  	return this.columnMetadata[column].columnWidth;
  }

  getInitialDisplayIndex(){
    return this.initialDisplayIndex;
  }

  getLastDisplayIndex(){
    return this.lastDisplayIndex;
  }

  getMaxColumnLength(){
    return this.maxColumnLength;
  }

  getLeftHiddenColumnWidth(){
    return this.leftHiddenColumnWidth;
  }

  getRightHiddenColumnWidth(){
    return this.rightHiddenColumnWidth;
  }
}

module.exports = ColumnProperties;