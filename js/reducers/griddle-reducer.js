//TODO: determine if there is a better way to make an empty immutable object
import Immutable from 'immutable';
import pick from '../utils/pick';
import extend from 'lodash.assign';
const initialState = Immutable.fromJS({});
import * as types from '../constants/action-types';

function combineAndOverrideReducers(containers) {
  if(!containers) { return {}; }
  containers.unshift({});
  let griddleReducers = extend.apply(this, containers);

  return griddleReducers;
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
    const griddleState = combineInitialState(initialStates);
    const griddleReducers = combineAndOverrideReducers(reducers);
    const griddleHelpers = combineAndOverrideReducers(helpers);

    //TODO: Decrease the inception
    return function griddleReducer(state = griddleState, action, helpers = griddleHelpers) {
      return griddleReducers[action.type] ?
        griddleReducers[action.type](state, action, helpers) :
        state;
    }
}

