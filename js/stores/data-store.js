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
    Object.keys(_this.helpers)
      .forEach(key => this[key] = this.helpers[key])

    //we want to store plugins / overrides as the actiontype rather than the plugin name
    var _actionHandlers = [];

    plugins.forEach(plugin => {
      this.state = !!plugin.initializeState ? plugin.initializeState(this.state) : this.state;

      //Add this plugin's pre/post actions
      var wireUpAction = (property) => {
        for (var actionType in plugin[property]) {
          if (_actionHandlers.hasOwnProperty(actionType)) {
            _actionHandlers[actionType][property].push(plugin[plugin][actionType])
          } else {
            const options = {};
            options[property] = plugin[property].length > 0 ? plugin[property][actionType] : [plugin[property][actionType]];
            _actionHandlers[actionType] = DataStore.createActionHandler(options);
          }
        }
      }

      wireUpAction("prePatches");
      wireUpAction("postPatches");

      //add the plugin's overrides
      for(var actionType in plugin.registeredCallbacks) {
        if (_actionHandlers.hasOwnProperty(actionType)) {
          _actionHandlers[actionType].override = plugin.registeredCallbacks[actionType];
        } else {
          _actionHandlers[actionType] = DataStore.createActionHandler({override: plugin.registeredCallbacks[actionType]})
        }
      }

      //add the helpers to the object -- overriding anything that came before
      Object.keys(!!plugin.helpers && plugin.helpers)
        .forEach(key => this[key] = plugin.helpers[key]);
    });

    //register the action callbacks
    dispatcher.register((action) => {
      let overridden = false;

      if(_actionHandlers.hasOwnProperty(action.actionType)){
        _actionHandlers[action.actionType]
          .prePatches
          .forEach(method => _this.state = method(action, _this.state));

        if(!!_actionHandlers[action.actionType].override) {
          overridden = true;
          _this.state = _actionHandlers[action.actionType].override(action, _this.state);
        }

        _actionHandlers[action.actionType]
          .postPatches
          .forEach(method => _this.state = method(action, _this.state));
      }

      if(!overridden) {
        _this.state = _this.registeredCallbacks[action.actionType](action, _this.state);
      }

       //TODO: there are some instances where we won't want to emit a change (aka state didn't change)
       _this.emitChange();
    });
  }

  get registeredCallbacks() {
    return {
      GRIDDLE_INITIALIZED(action, state){
      },

      GRIDDLE_LOADED_DATA(action, state){
        return state.set('data', Immutable.fromJS(action.data));
      }
    }
  }


  /* HELPERS */
  get helpers() {
    return {
      getVisibleData() {
        return this.state.get('data');
      },

      getState() {
        return this.state;
      }
    }
  }

  static createActionHandler(properties) {
    if(properties)
      return {prePatches: (properties.prePatches || []), postPatches: (properties.postPatches || []), override: properties.override || null}
  }
}
module.exports = DataStore;
