/**
 * getUserId.js
 *
 * Injected in the DOM, it gets the user ID and sends it back
 * to popup.js
 *
 * @author Luis A. Martínez <http://github.com/Zerquix18>
 * @copyright Copyright Luis A. Martínez 2016
 * 
 */
(function () {
  var result = function (success, response) {
    chrome.runtime.sendMessage(
      {
        action: "getId",
        result: {success: success, response: response}
      }
    );
  };

  if (document.readyState !== 'complete') {
    // let the DOM load please
    result(false, 'Please, try again in 3 seconds');
    return;
  }

  var id       = '';
  var element  = document.querySelector('.fbTimelineSectionExpandPager');
  var element2 = document.querySelector('#pagelet_loggedout_sign_up .uiButton');
  
  if (element) {
    // if this element exists it's because we're on a profile
    // and the user is logged
    var gt = element.dataset.gt;
    if (!gt) {
      // if gb changes this...
      result(false, 'Could not find user ID :(');
      return;
    }
    var json = JSON.parse(gt);
        id   = json.profile_id;
  } else if (element2) {
    // valid profile but user logged out
    result(false, 'You must be logged in to view hidden pictures');
    return;
  } else {
    result(false, 'Could not find hidden photos. Is this a valid profile?');
    return;
  }

  result(true, id);

})();
