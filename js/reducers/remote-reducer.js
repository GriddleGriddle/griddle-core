function updateData(data, pagesLoaded, state, action, helpers) {
  const loadsInProgress = state.get('loadsInProgress') - 1;
  state = state.set('data', data)
              .setIn(['pageProperties', 'currentPage'], action.currentPage)
              .setIn(['pageProperties', 'maxPage'], action.maxPage)
              .set('pagesLoaded', pagesLoaded)
              .set('loadsInProgress', loadsInProgress >= 0 ? loadsInProgress : 0);

  return helpers.updateVisibleData(state);
}

export function GRIDDLE_START_LOADING(state, action, helpers) {
  return state.set('loadsInProgress', state.get('loadsInProgress') + 1)
              .set('loadError', false);
}

export function GRIDDLE_REMOTE_REPLACE_DATA(state, action, helpers) {
  return updateData(action.data, [action.currentPage], state, action, helpers);
}

export function GRIDDLE_REMOTE_APPEND_DATA(state, action, helpers) {
  const appendedData = state.get('data').concat(action.data);
  const loadedPages = state.get('pagesLoaded').concat(action.currentPage);

  return updateData(appendedData, loadedPages, state, action, helpers);
}

export function GRIDDLE_REMOTE_PREPEND_DATA(state, action, helpers) {
  const prependedData = state.get('data').splice(0, 0, action.data);
  const loadedPages = state.get('pagesLoaded').splice(0, 0, action.currentPage);

  return updateData(prependedData, loadedPages, state, action, helpers);
}

export function GRIDDLE_REMOTE_ERROR(state, action, helpers) {
  const loadsInProgress = state.get('loadsInProgress') - 1;

  return state.set('loadError', true)
              .set('loadsInProgress', loadsInProgress >= 0 ? loadsInProgress : 0);
}