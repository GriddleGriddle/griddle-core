import * as types from '../constants/action-types';
import * as localActions from './local-actions';
import request from 'superagent';

function loadPageAjax(remoteConfig, tableState, successDispatch) {
  dispatch => {
    // Indicate that our AJAX request is starting.
    dispatch(startLoading());

    const { url, requestHeaders, formatRequest, formatSuccess, formatError } = remoteConfig;

    // Set up the request.
    let loadRequest = request.get(url);

    // If the request needs to be constructed differently, pass to the override function.
    if (formatRequest) {
      loadRequest = formatRequest(loadRequest, tableState);
    } else {
      const { page, pageSize, filter, sortColumn, sortDirection } = tableState;

      // Add parameters
      loadRequest = loadRequest.query({ page: page,
                                        pageSize: pageSize,
                                        filter: filter,
                                        sortColumn: sortColumn,
                                        sortDirection: sortDirection });

      // Add any headers added to the remote config
      if (requestHeaders) {
        Object.keys(requestHeaders).forEach(key => {
          loadRequest = loadRequest.set(key, requestHeaders[key]);
        });
      }
    }

    loadRequest.end(function(err, res){
      if (res.ok) {
        let successResponse = res.body;

        // Format if necessary.
        if (formatSuccess) {
          successResponse = formatSuccess(successResponse);
        }

        // Dispatch the success
        dispatch(successDispatch);
      } else {
        let errorResponse = res.body;

        // Format if necessary
        if (formatError) {
          errorResponse = formatError(err, errorResponse);
        }

        // Dispatch the error
        dispatch(remoteError(err, errorResponse));
      }
    });
  }
}

export function remoteError(err, response) {
  // TODO: Include a little more information about this error.

  return {
    type: types.GRIDDLE_REMOTE_ERROR
  };
}

export function startLoading() {
  return {
    type: types.GRIDDLE_START_LOADING
  };
}

export function initializeGrid() {
  dispatch => {
    // Initialize the grid.
    dispatch(localActions.initializeGrid());

    // Load the first page of results.
    dispatch(loadPage(1));
  }
}

export function filterData(response, filter) {
  return dispatch => {
    // Append the data.
    dispatch({
      type: types.GRIDDLE_REMOTE_REPLACE_DATA,
      currentPage: response.page,
      maxPage: response.maxPage,
      data: response.data
    });

    // Execute the filter.
    dispatch(localActions.filterData(filter));
  };
}

export function filterDataRemote(remoteConfig, tableState) {
  return makeRequest(remoteConfig, tableState, (response) => {
    return filterData(response, tableState.filter);
  });
}

export function setPageSize(response, pageSize) {
  return dispatch => {
    // Append the data.
    dispatch({
      type: types.GRIDDLE_REMOTE_REPLACE_DATA,
      currentPage: response.page,
      maxPage: response.maxPage,
      data: response.data
    });

    // Set the page size.
    dispatch(localActions.setPageSize(pageSize));
  };
}

export function setPageSizeRemote(remoteConfig, tableState) {
  return makeRequest(remoteConfig, tableState, (response) => {
    return setPageSize(response, tableState.pageSize);
  });
}

export function sort(response, sortColumn) {
  return dispatch => {
    // Append the data.
    dispatch({
      type: types.GRIDDLE_REMOTE_REPLACE_DATA,
      currentPage: response.page,
      maxPage: response.maxPage,
      data: response.data
    });

    // Finish the sort.
    dispatch(localActions.sort(sortColumn));
  };
}

export function sortRemote(remoteConfig, tableState) {
  return makeRequest(remoteConfig, tableState, (response) => {
    return sort(response, tableState.sortColumn);
  });
}

export function addSortColumn(response, sortColumn) {
  return dispatch => {
    // Append the data.
    dispatch({
      type: types.GRIDDLE_REMOTE_REPLACE_DATA,
      currentPage: response.page,
      maxPage: response.maxPage,
      data: response.data
    });

    // Finish the sort.
    dispatch(localActions.addSortColumn(sortColumn));
  };
}

export function addSortColumnRemote(remoteConfig, tableState) {
  return makeRequest(remoteConfig, tableState, (response) => {
    return addSortColumn(response, tableState.sortColumn);
  });
}

export function loadNext(response) {
  return dispatch => {
    // Append the data.
    dispatch({
      type: types.GRIDDLE_REMOTE_APPEND_DATA,
      currentPage: response.page,
      maxPage: response.maxPage,
      data: response.data
    });

    // Load the next page, now that we have the data.
    dispatch(localActions.loadNext());
  }
}

export function loadNextRemote(remoteConfig, tableState) {
  return makeRequest(remoteConfig, tableState, (response) => {
    return loadNext(response);
  });
}

export function loadPrevious(response) {
  return dispatch => {
    // Append the data.
    dispatch({
      type: types.GRIDDLE_REMOTE_PREPEND_DATA,
      currentPage: response.page,
      maxPage: response.maxPage,
      data: response.data
    });

    // Load the previous page, now that we have the data.
    dispatch(localActions.loadPrevious());
  };
}

export function loadPreviousRemote(remoteConfig, tableState) {
  return makeRequest(remoteConfig, tableState, (response) => {
    return loadPrevious(response);
  });
}

export function loadPage(response) {
  return dispatch => {
    // Replace the data.
    dispatch({
      type: types.GRIDDLE_REMOTE_REPLACE_DATA,
      currentPage: response.page,
      maxPage: response.maxPage,
      data: response.data
    });

    // Load the specified page, now that we have the data.
    dispatch(localActions.loadPage(response.page));
  };
}

export function loadPageRemote(remoteConfig, tableState) {
  return makeRequest(remoteConfig, tableState, (response) => {
    return loadPage(response);
  });
}
