define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
  ActionUtils
) => {
  'use strict';

  class callDocZoom extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.key 
     * @param {number} params.index 
     * @param {any} params.current 
     */
    async run(context, { key, index, current }) {
      const { $page, $flow, $application } = context;

      const navigateToPageSimpleZoomResult = await Actions.navigateToPage(context, {
        page: 'doc-zoom',
        params: {
          documentPath: current.data.path,
          filename: current.data.filename,
          iframeUrl: 'https://objectstorage.'+ current.data.region +'.oraclecloud.com' + current.data.path + '#page=' + current.data.page,
          contentType: current.data.contentType
        },
      });
    }
  }

  return callDocZoom;
});
