//clean these up
var StoreBoilerplate = require('./store-boilerplate');
var Constants = require('../constants/constants');
var Immutable = require('immutable');
var MAX_SAFE_INTEGER = require('max-safe-integer');

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
            _actionHandlers[actionType][property].push(plugin[property][actionType])
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
        .forEach(key => this[key] = plugin.helpers[key].bind(this));
    });

    //register the action callbacks
    dispatcher.register((action) => {
      let overridden = false;
      let actionState = _this.state;
      let continueIfUpdatingState = function(method){
        actionState = method(action, actionState, _this);
        return !!actionState;
      }

      if(_actionHandlers.hasOwnProperty(action.actionType)){
        _actionHandlers[action.actionType]
          .prePatches
          .every(continueIfUpdatingState);

        // If the action is forcing a change not to result in an emit, return.
        if (actionState === null) { return; }

        if(!!_actionHandlers[action.actionType].override) {
          overridden = true;
          actionState = _actionHandlers[action.actionType].override(action, _this.state, _this);
        }

        if (actionState === null) { return; }

        _actionHandlers[action.actionType]
          .postPatches
          .every(continueIfUpdatingState);

        if (actionState === null) { return; }
      }

      if(!overridden) {
        actionState = _this.registeredCallbacks[action.actionType](action, _this.state, _this);
      }

      if (actionState === null) { return; }

      _this.state = actionState;
      _this.emitChange();
    });
  }

  get registeredCallbacks() {
    return {
      GRIDDLE_INITIALIZED(action, state){
      },

      GRIDDLE_LOADED_DATA(action, state){
        return state.set('data', Immutable.fromJS(action.data))
          .set('renderProperties', Immutable.fromJS(action.properties));
      }
    }
  }


  /* HELPERS */
  get helpers() {
    return {
      getVisibleData(state = this.state) {
        return state.get('data');
      },

      getState(state = this.state) {
        return state;
      },

      getPageProperties(state = this.state) {

        return state.get('pageProperties');
      },

      getColumnTitles(state = this.state) {
        if(state.get('renderProperties') && state.get('renderProperties').get('columnProperties').size !== 0) {
          return state
            .get('renderProperties')
            .get('columnProperties')
            .filter(column => !!column.get('displayName'))
            .map(column => {
              let col = {};
              col[column.get('id')] = column.get('displayName');
              return col;
            }).toJSON();
        }

        return {};
      },

      getColumnProperties(state = this.state) {
        if(state.get('renderProperties') && state.get('renderProperties').get('columnProperties').size !== 0) {
          return state
            .get('renderProperties')
            .get('columnProperties').toJSON();
        }

        return {};
      },

      getDataColumns(state, data) {
        if(state.get('renderProperties') && state.get('renderProperties').get('columnProperties').size !== 0) {
          const keys = state
            .get('renderProperties')
            .get('columnProperties')
            .sortBy(col => col.get('order')||MAX_SAFE_INTEGER)
            .keySeq()
            .toJSON();

          return data
            .map(item => item
              .filter((val, key) => keys.indexOf(key) > -1 )
              .sortBy((val, key) => keys.indexOf(key))
            );
        }

        return data;
      }
    }
  }

  static createActionHandler(properties) {
    if(properties)
      return {prePatches: (properties.prePatches || []), postPatches: (properties.postPatches || []), override: properties.override || null}
  }

}
module.exports = DataStore;
