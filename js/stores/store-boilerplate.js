var assign = require('object-assign'); 
var EventEmitter = require('eventemitter3').EventEmitter;

module.exports = assign({}, EventEmitter.prototype, {
   //boilerplate
  emitChange: function(){
    this.emit('change'); 
  },

  //boilerplate
  addChangeListener: function(callback){
    this.on('change', callback);
  },

  //boilerplate
  removeChangeListener: function(callback){
    this.removeListener('change', callback);
  }  
});
