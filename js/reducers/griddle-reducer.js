//TODO: determine if there is a better way to make an empty immutable object
import Immutable from 'immutable';
import pick from 'lodash.pick';
import extend from 'lodash.assign';
const initialState = Immutable.fromJS({});
import * as types from '../constants/action-types';

function combineAndOverrideReducers(containers) {
  if(!containers) { return {}; }
  containers.unshift({});
  let griddleReducers = extend.apply(this, containers);

  return griddleReducers;
}

/*
  This method creates a pipeline of reducers. This is mainly
  used for the before / after reducers
*/
function getReducersByWordEnding(reducers, ending) {
  return reducers.reduce((previous, current) => {
    const keys = Object.keys(current).filter((name) => name.endsWith(ending));

    let reducer = pick(current, keys);

    //TODO: clean this up it's a bit hacky
    for (var key in current) {
      if(!key.endsWith(ending)) { continue; }

      const keyWithoutEnding = key.replace(`_${ending}`, "");
      //make a new method that pipes output of previous into state of current
      //this is to allow chaining these
      const hasPrevious =  previous.hasOwnProperty(keyWithoutEnding) && typeof previous[keyWithoutEnding] === 'function';
      const previousReducer = hasPrevious ? previous[keyWithoutEnding] : undefined;
      const currentReducer = reducer[key]

      reducer[keyWithoutEnding] = wrapReducer(currentReducer, previousReducer);
    }

    //override anything in previous (since this now calls previous to make sure we have helpers from both);
    return extend(previous, reducer);
  }, {});
}

function getBeforeReducers(reducers) {
  return getReducersByWordEnding(reducers, "BEFORE");
}

function getAfterReducers(reducers) {
  return getReducersByWordEnding(reducers, "AFTER");
}

//feed the result of previous reducer into next
function wrapReducer(next, previous) {
  //if previous reducer exists -- return the result of wrapper as state to next
  return previous && typeof(previous) === 'function' && typeof(next) === 'function' ? 
    (state, action, helpers) => next(previous(state, action, helpers), action, helpers) :
    next;
}

function isFunctionOrUndefined(item) {
  return typeof(item) === 'function' || typeof(item) === 'undefined';
}

function wrapReducers(...reducers) {
  const finalReducer = reducers.reduce((previous, current) => {
    //get all reducer methods and either set the prop 
    for(var key in current) {
      if(isFunctionOrUndefined(current[key]) && isFunctionOrUndefined(previous[key])){
        previous[key] = wrapReducer(current[key], previous[key]);
      }
    }
    
    return previous;
  }, {});

  return finalReducer;
}

function combineInitialState(states) {
  //TODO: Do this in a better way
  let griddleState = initialState;

  for(const state in states) {
    griddleState = griddleState.mergeDeep(states[state]);
  }

  return griddleState;
}

//TODO: maybe add helpers in here too and override them on add. idk
export default function buildGriddleReducer(initialStates, reducers, helpers) {
    const beforeReducers = getBeforeReducers(reducers);
    const afterReducers = getAfterReducers(reducers);
    const griddleReducers = combineAndOverrideReducers(reducers);

    const finalReducer = wrapReducers(beforeReducers, griddleReducers, afterReducers);

    const griddleState = combineInitialState(initialStates);
    const griddleHelpers = combineAndOverrideReducers(helpers);

    //TODO: Decrease the inception
    return function griddleReducer(state = griddleState, action, helpers = griddleHelpers) {
      return finalReducer[action.type] ?
        finalReducer[action.type](state, action, helpers) :
        state;
    }
}

