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

  class inputSearch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.itemContext 
     * @param {string} params.originButton 
     * @param {any} params.value 
     */
    async run(context, { itemContext, originButton = 'search', value }) {
      const { $page, $flow, $application } = context;

      const callFunctionResult = await $page.functions.log('$variables.itemContext');

      if (itemContext) {
        $page.variables.searchText = itemContext.data.title;
      }
      else {
        $page.variables.searchText = $page.variables.rawSearch; 
      }

      const callChainSearchActionJSResult = await Actions.callChain(context, {
        chain: 'searchActionJS',
        params: {
          originButton: originButton,
        },
      });
      
    }
  }

  return inputSearch;
});
