define([
    'ojs/ojoffcanvas',
    'ojs/ojresponsiveknockoututils',
    'ojs/ojresponsiveutils'],
  (
    OffCanvasUtils,
    ResponsiveKnockoutUtils,
    ResponsiveUtils
  ) => {
  'use strict';

  const drawerParams = {
    displayMode: 'push',
    selector: '#navDrawer',
    content: '#pageContent'
  };

  class PageModule {
    toggleDrawer() {
      return OffCanvasUtils.toggle(drawerParams);
    };
  }

  // If the drawer is open and the page gets resized close it on medium and larger screens
  const mdQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
  const mdScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);
  mdScreen.subscribe(function() {
    OffCanvasUtils.close(drawerParams);
  });

  return PageModule;
});