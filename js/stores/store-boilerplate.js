var assign = require('object-assign');
var EventEmitter = require('eventemitter3').EventEmitter;

class StoreBoilerplate extends EventEmitter {
  constructor() {
    super();
  }
  emitChange() {
    this.emit('change');
  }

  addChangeListener(callback) {
    this.on('change', callback);
  }

  removeChangeListener(callback) {
    this.removeListener('change', callback);
  }

  finishChange(action) {
    ScrollPlugin.registeredCallbackPlugins(action);
    this.emitChange();
  }
}


module.exports = StoreBoilerplate;
 module.exports.other = assign({}, EventEmitter.prototype, {
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
  },

  finishChange(action) {
    ScrollPlugin.registeredCallbackPlugins(action);
    DataStore.emitChange();
  }
});

