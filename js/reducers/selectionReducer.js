import * as types from '../constants/action-types';
import Immutable from 'immutable';
import * as HelperContainer from '../helpers';
import extend from 'lodash.assign';
//TODO: Toss this in a helper somewhere -- this and subgrid are using it
function getProperties(columns) {
  return extend({
    childrenPropertyName: 'children',
    columns: []
  }, columns);
}
//TODO: This is the same as subgridReducer toggleExpanded -- we need to make something
//      that takes a template method as a parameter and does the recursion and runs the template at the end
function selectRow(data, rowTemplateFunction, childrenPropertyName = 'children') {
  if(!rowTemplateFunction) { return data; }

  return data.map(row => {
    let children = row.get(childrenPropertyName);

    if(children && children.size > 0) {
      children = selectRow(children, griddleKey)
    }

    return rowTemplateFunction(row.set(childrenPropertyName, children));
  });
}

export function GRIDDLE_ROW_SELECTION_TOGGLED(state, action, helpers) {
  const { griddleKey } = action;
  const columns = helpers.getDataColumns(state, state.get('data'));
  const properties = getProperties(columns);

  const template = (row) => row
    .set('selected', row.get('griddleKey') === griddleKey ?
      !row.get('selected') :
      row.get('selected'));

  return state.set('data', selectRow(state.get('data'), template, griddleKey, properties.childrenPropertyName));
}
