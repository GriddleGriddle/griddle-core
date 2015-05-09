//clean these up
var assign = require('object-assign');
var DataHelper = require('../helpers/data-helper');
var StoreBoilerplate = require('./store-boilerplate');
var Constants = require('../constants/constants');
var LocalActions = require('../actions/local-action-creators');
var _ = require('lodash');
var ScrollPluginInstance = require('./store_plugins/scroll-store.js');
var EventEmitter = require('eventemitter3').EventEmitter;
var Immutable = require('immutable');


var defaultGridState = {
  data: [],
};


class DataStore extends StoreBoilerplate{
  constructor(dispatcher, plugins) {
    super();

    const _this = this;
    _this.state = new Immutable.fromJS(defaultGridState);

    this.plugins = [];
    _.each(plugins, function(plugin){
      _this.plugins.push(new plugin());
    });

    dispatcher.register((action) => {
      //prepatches
      this.plugins.forEach(plugin => {
        if(!!plugin.PrePatches && typeof plugin.PrePatches[action.actionType] !== "undefined") {
          _this.state = plugin.PrePatches[action.actionType](action, _this.state);
        }
      });

      //overrides
      let overridden = this.plugins.reverse().some((plugin) => {
        if(typeof plugin.RegisteredCallbacks[action.actionType] !== "undefined"){
            _this.state = plugin.RegisteredCallbacks[action.actionType](action, _this.state);
            return true;
        }

        return false;
      });

      if(!overridden) {
        _this.state = _this.RegisteredCallbacks[action.actionType](action, this.state);
      }

      //post patches
      this.plugins.forEach(plugin => {
        if(!!plugin.PostPatches && !!plugin.PostPatches[action.actionType]) {
          _this.state = plugin.PostPatches[action.actionType](action, _this.state);
          debugger;
        }
      });

      _this.emitChange();
    });
  }

  get RegisteredCallbacks(){
    return {
      GRIDDLE_INITIALIZED(action, state){
      },

      GRIDDLE_LOADED_DATA(action, state){
        return state.set('data', Immutable.fromJS(action.data));
      }
    }
  }

  /* HELPERS */
  getData() {
    return this.state.data;
  }

  getState() {
    return this.state;
  }

}
module.exports = DataStore;
