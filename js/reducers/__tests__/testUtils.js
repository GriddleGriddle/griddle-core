import Immutable from 'immutable';
import extend from 'lodash.assign';

export function getMethod(options) {
  if(!options.method) {
    throw "Need a method to call"
  }

  const combined = extend({state: Immutable.fromJS({}), payload: {}, helpers: {}, method: null}, options);
  const { state, payload, helpers, method } = combined;
  return method.call(this, state, payload, helpers);
}

export function getReducer(options, method) {
  return getMethod(extend(options, { method }));
}

