import Immutable from 'immutable';

export function GRIDDLE_LOADED_DATA_BEFORE(state, action, helpers) {console.log("HI FROM TEST"); return state; }
export function GRIDDLE_LOADED_DATA_AFTER(state, action, helpers) {console.log("BYE FROM TEST"); return state; }