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

  class WelcomePageTemplateSpPrimaryActionChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application } = context;

      const navigateToPageInputSearchResult = await Actions.navigateToPage(context, {
        page: 'input-search',
      });
    }
  }

  return WelcomePageTemplateSpPrimaryActionChain;
});
