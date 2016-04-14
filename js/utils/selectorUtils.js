import { createSelector } from 'reselect';

export const createGriddleSelector = (context, ...args) => {
  const boundArguments = args.map(a => typeof a === 'function' ? a.bind(context) : a);
  const selector = createSelector(...boundArguments);
  return selector;
}
