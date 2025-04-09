define([
    'ojs/ojoffcanvas'],
  (OffCanvasUtils) => {
  'use strict';

  class FragmentModule {
    closeDrawer() {
      return OffCanvasUtils.close({selector: '#navDrawer'});
    };
  };

  return FragmentModule;
});