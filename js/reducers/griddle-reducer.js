//TODO: determine if there is a better way to make an empty immutable object
import Immutable from 'immutable';
import pick from 'lodash.pick';
import extend from 'lodash.assign';
const initialState = Immutable.fromJS({});

//from MDN
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

export function combineAndOverrideReducers(containers) {
  if(!containers) { return {}; }
  containers.unshift({});
  let griddleReducers = extend.apply(this, containers);
  containers.shift();
  return griddleReducers;
}

/*
  This method creates a pipeline of reducers. This is mainly
  used for the before / after reducers
*/
export function getReducersByWordEnding(reducers, ending) {
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

    return extend(previous, reducer);
  }, {});
}

export function getBeforeReducers(reducers) {
  return getReducersByWordEnding(reducers, "BEFORE");
}

export function getAfterReducers(reducers) {
  return getReducersByWordEnding(reducers, "AFTER");
}

//feed the result of previous reducer into next
export function wrapReducer(next, previous) {
  //if previous reducer exists -- return the result of wrapper as state to next
  return previous && typeof(previous) === 'function' && typeof(next) === 'function' ?
    (state, action, selectors) => next(previous(state, action, selectors), action, selectors) :
    next;
}

//TODO: Maybe this is dumb becuase it's just wrapping a typeof
function isFunction(item) {
  return typeof(item) === 'function';
}

function isFunctionOrUndefined(item) {
  return isFunction(item) || typeof(item) === 'undefined';
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

export function combineInitialState(states) {
  //TODO: Do this in a better way
  let griddleState = initialState;

  for(const state in states) {
    griddleState = griddleState.mergeDeep(states[state]);
  }

  return griddleState;
}

//TODO: This is not the most efficient way to do this.
export function buildReducerWithHooks(reducers, reducer) {
  const filteredReducerEndings = ['BEFORE', 'AFTER', 'BEFORE_REDUCE', 'AFTER_REDUCE'];

  const validKeys = Object.keys(reducer).filter(key => {
    return !filteredReducerEndings.some(reducerEnding => key.endsWith(reducerEnding))
  });

  const preReduce = getReducersByWordEnding(reducers, "BEFORE_REDUCE").BEFORE_REDUCE;
  const postReduce = getReducersByWordEnding(reducers, "AFTER_REDUCE").AFTER_REDUCE;

  let retVal = {};
  validKeys.forEach(key => retVal[key] = wrapReducer(postReduce, wrapReducer(preReduce, reducer[key])));

  return extend(reducer, retVal);
}

export default function buildGriddleReducer(initialStates, reducers) {
    const beforeReducers = getBeforeReducers(reducers);
    const afterReducers = getAfterReducers(reducers);
    const griddleReducers = combineAndOverrideReducers(reducers);

    const wrappedReducers = buildReducerWithHooks(reducers, wrapReducers(beforeReducers, griddleReducers, afterReducers));
    const finalReducer = wrappedReducers;

    const griddleState = combineInitialState(initialStates);

    //TODO: Decrease the inception
    return function griddleReducer(state = griddleState, action) {
      return finalReducer[action.type] ?
        finalReducer[action.type](state, action) :
        state;
    }
}

