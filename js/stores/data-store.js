//clean these up
var StoreBoilerplate = require('./store-boilerplate');
var Constants = require('../constants/constants');
var Immutable = require('immutable');


var defaultGridState = {
  data: [],
  pageProperties: {
    currentPage: 0,
    maxPage: 0,
    pageSize: 0
  }
};


class DataStore extends StoreBoilerplate{
  constructor(dispatcher, plugins) {
    super();

    const _this = this;
    _this.state = new Immutable.fromJS(defaultGridState);

    //add the helper functions directly onto the object
    Object.keys(_this.Helpers)
      .forEach(key => this[key] = this.Helpers[key])

    //add the plugins to the plugins collection
    this.plugins = [];
    plugins.forEach(plugin => {
      const pluginInstance = new plugin(this.state);
      this.state = pluginInstance.initializeState(this.state);

      this.plugins.push(pluginInstance);

      //add the helpers to the object -- overriding anything that came before
      Object.keys(!!pluginInstance.Helpers && pluginInstance.Helpers)
        .forEach(key => this[key] = pluginInstance.Helpers[key])
    });

    //register the action callbacks
    dispatcher.register((action) => {
      //prepatches
      //this will run through all of the plugins that have
      //this method registered as a prepatch
      this.plugins.forEach(plugin => {
        if(!!plugin.PrePatches && typeof plugin.PrePatches[action.actionType] !== "undefined") {
          _this.state = plugin.PrePatches[action.actionType](action, _this.state);
        }
      });

      //overrides
      //this grabs the last plugin that has the same method name as an override
      //the result of the some method will be false if there are no matches and it will run
      //the standard action callback
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
      //this will run through all of the plugins that have
      //this method registered as a postpatch
      this.plugins.forEach(plugin => {
        if(!!plugin.PostPatches && !!plugin.PostPatches[action.actionType]) {
          _this.state = plugin.PostPatches[action.actionType](action, _this.state);
        }
      });

       //TODO: there are some instances where we won't want to emit a change (aka state didn't change)
       _this.emitChange();
    });
  }

  get RegisteredCallbacks() {
    return {
      GRIDDLE_INITIALIZED(action, state){
      },

      GRIDDLE_LOADED_DATA(action, state){
        return state.set('data', Immutable.fromJS(action.data));
      }
    }
  }


  /* HELPERS */
  get Helpers() {
    return {
      getVisibleData() {
        return this.state.get('data');
      },

      getState() {
        return this.state;
      }
    }
  }

}
module.exports = DataStore;
