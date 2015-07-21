//TODO: determine if there is a better way to make an empty immutable object
import Immutable from 'immutable';
import pick from '../utils/pick';

const initialState = Immutable.fromJS({});

let griddleState = initialState;

//a new object
let griddleHandlers = {};

//TODO: maybe add helpers in here too and override them on add. idk
export default function griddleReducer(state = griddleState, action) {
    return griddleHandlers[action.type] ?
      griddleHandlers[action.type](state, action) :
      state;
}

//this is how you register a  reducer with the griddle composed store
export function registerReducer(state, handlers) {
  const finalHandlers = pick(handlers, (val) => typeof val === 'function');

  if(state) {
    griddleState = griddleState.mergeDeep(state);
  }

  //This overrides anything that came before it
  for(const key in handlers) {
    griddleHandlers[key] = handlers[key];
  }
}