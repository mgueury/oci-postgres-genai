define([], () => {
  'use strict';

  class PageModule {

    /**
     *
     * @param {String} arg1
     * @return {String}
     */
    log(arg1) {
      // console.log('MGUEURY-' + JSON.stringify(arg1));
    }

    /**
     *
     * @param {String} hits
     * @return {String}
     */
    TruncateContent(hits) {

      // This is a kind of improved substring to show only the first character of the content
      // Ideally this should be done in OpenSearch index directly (?)
      hits.forEach((hit, index, array) => {
        console.log("TruncateContent before: " + hit.content);
        if (hit.content) {
          console.log("TruncateContent debug 1");
          if (hit.content.length > 1000) {
            // Since the _content result could be huge (the file). Take first the 500 first characters  
            let s = hit.content = hit.content.substring(0, 500);
            // Replace multiples spaces by one
            s = s.replace(/\s\s+/g, ' ');
            // Replace strange unicode character
            s = s.replace(/\uF0B7/g, ' ');
            // Take the first space after 200 character to avoid to split in the middle of a word
            let pos = s.indexOf(' ', 800);
            // Replace content with the substring
            hit.content = s.substring(0, pos);
          };
        } else {
          // For image where there is no content
          hit.content = "No content";
        }
        let s = hit.content;
        console.log("TruncateContent after: " + hit.content);
        // XXXXXXX
        // hit.region = "eu-frankfurt-1";
        // hit.context = "hello";
        array[index] = hit;
      });
      console.log("TruncateContent end: " + hits);
      return hits;

    }

    /**
     *
     * @param {String} arg1
     * @return {String}
     */
    on_mic_click(arg1) {
       


    }





    /**
     *
     * @param {String} arg1
     * @return {String}
     */
    hideRegions(arg1) {
      document.getElementById('imageContainer').style.display = 'none';
    }

    /**
     *
     * @param {String} arg1
     * @return {String}
     */
    HideOtherRegions(arg1) {
      document.getElementById('allContainer').style.display = 'none';

      document.getElementById('imagesearch').classList.add("active");
      document.getElementById('allsearch').classList.remove("active");

    }

    /**
     *
     * @param {String} arg1
     * @return {String}
     */
    displayimage(arg1) {
      document.getElementById('imageContainer').style.display = 'block';
    }

    /**
     *
     * @param {String} arg1
     * @return {String}
     */
    displayImageContainer(arg1) {
      document.getElementById('imageContainer').style.display = 'block';
    }
  }

  return PageModule;
});
