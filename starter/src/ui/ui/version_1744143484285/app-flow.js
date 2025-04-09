define(['oj-sp/spectra-shell/config/config'], function() {
  'use strict';

  class AppModule {

   /**
     * Return the current Date + 1 hour in UTC format 
     * @return {String}
     */
    getFutureDateUTC() {
      const d = new Date();
      d.setTime(d.getTime() + 1 * 60 * 60 * 1000);
      const isoStr = d.toISOString();
      return isoStr;
    }

    getObjectStorageItem( path ) {
      const a = path.split("/");
      let item = { "namespace": a[2], "bucketName": a[4], "objectName": a[6] };
      return item;
    }

  }
  
  return AppModule;
});

