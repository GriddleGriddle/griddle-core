import * as reducers from './reducers';
import * as states from './initialStates/index';
import GriddleReducer from './reducers/griddle-reducer';
import * as GriddleActions from './actions/local-actions';
import * as SubgridActions from './actions/subgrid-actions';
import * as SelectionActions from './actions/selection-actions';
import * as GriddleHelpers from './helpers';
import extend from 'lodash.assign';

const GridActions = extend(GriddleActions, SubgridActions, SelectionActions);
console.log(Object.keys(GridActions));

export { reducers as Reducers }
export { states as States }
export { GridActions as GriddleActions };
export { GriddleReducer as GriddleReducer };
export {GriddleHelpers as GriddleHelpers}