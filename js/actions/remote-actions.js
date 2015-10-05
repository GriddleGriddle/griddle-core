import * as types from '../constants/action-types';
import * as localActions from './local-actions';
import request from 'superagent';

function startLoading() {
  return {
    type: types.GRIDDLE_START_LOADING
  };
}

function loadPageAjax(remoteConfig, page, pageSize, filter, sortColumn, sortDirection, successCallback) {
  dispatch => {
    // Indicate that our AJAX request is starting.
    dispatch(startLoading());

    const { url, requestHeaders, formatRequest, formatSuccess, formatError } = remoteConfig;

    // Set up the request.
    let loadRequest = request.get(url);

    // If the request needs to be constructed differently, pass to the override function.
    if (formatRequest) {
      loadRequest = formatRequest(loadRequest, page, pageSize, filter, sortColumn, sortDirection);
    } else {
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
        successCallback(res);
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

function remoteError(err, response) {
  // TODO: Include a little more information about this error.

  return {
    type: types.GRIDDLE_REMOTE_ERROR
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

export function filterData(filter) {
  return dispatch => {
    dispatch(loadPageAjax(remoteConfig, page, pageSize, filter, sortColumn, sortDirection, (data) => {
        // Append the data.
        dispatch({
          type: types.GRIDDLE_REMOTE_REPLACE_DATA,
          page: page,
          data: data
        });

        // Execute the filter.
        dispatch(localActions.filterData(filter));
    });
  };
}

export function setPageSize(pageSize) {
  return dispatch => {
    dispatch(loadPageAjax(remoteConfig, page, pageSize, filter, sortColumn, sortDirection, (data) => {
        // Append the data.
        dispatch({
          type: types.GRIDDLE_REMOTE_REPLACE_DATA,
          page: page,
          data: data
        });

        // Set the page size.
        dispatch(localActions.setPageSize(pageSize));
    });
  };
}

export function sort(remoteConfig, page, pageSize, filter, sortColumn, sortDirection){
  return dispatch => {
    dispatch(loadPageAjax(remoteConfig, page, pageSize, filter, sortColumn, sortDirection, (data) => {
        // Append the data.
        dispatch({
          type: types.GRIDDLE_REMOTE_REPLACE_DATA,
          page: page,
          data: data
        });

        // Finish the sort.
        dispatch(localActions.sort(sortColumn));
    });
  };
}

export function addSortColumn(remoteConfig, page, pageSize, filter, sortColumn, sortDirection){
  return dispatch => {
    dispatch(loadPageAjax(remoteConfig, page, pageSize, filter, sortColumn, sortDirection, (data) => {
        // Append the data.
        dispatch({
          type: types.GRIDDLE_REMOTE_REPLACE_DATA,
          page: page,
          data: data
        });

        // Finish the sort.
        dispatch(localActions.addSortColumn(sortColumn));
    });
  };
}

export function loadNext(remoteConfig, page, pageSize, filter, sortColumn, sortDirection){
  return dispatch => {
    dispatch(loadPageAjax(remoteConfig, page, pageSize, filter, sortColumn, sortDirection, (data) => {
        // Append the data.
        dispatch({
          type: types.GRIDDLE_REMOTE_APPEND_DATA,
          page: page,
          data: data
        });

        // Load the next page, now that we have the data.
        dispatch(localActions.loadNext());
    });
  }
}

export function loadPrevious(remoteConfig, page, pageSize, filter, sortColumn, sortDirection){
  return dispatch => {
    dispatch(loadPageAjax(remoteConfig, page, pageSize, filter, sortColumn, sortDirection, (data) => {
        // Append the data.
        dispatch({
          type: types.GRIDDLE_REMOTE_PREPEND_DATA,
          page: page,
          data: data
        });

        // Load the previous page, now that we have the data.
        dispatch(localActions.loadPrevious());
    });
  };
}

export function loadPage(remoteConfig, page, pageSize, filter, sortColumn, sortDirection){
  return dispatch => {
    dispatch(loadPageAjax(remoteConfig, page, pageSize, filter, sortColumn, sortDirection, (data) => {
        // Append the data.
        dispatch({
          type: types.GRIDDLE_REMOTE_REPLACE_DATA,
          page: page,
          data: data
        });

        // Load the specified page, now that we have the data.
        dispatch(localActions.loadPage(page));
    });
  };
}
