// Copyright (c) 2016 Luis A. Martinez. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.


/******************** FUNCTIONS *******************/

/**
 * Displays an error or a success message in the popup and notifies something
 * @param {String} result   Must be success|error
 * @param {String} response The text message with the response
 */
function displayResult(result, response) {
  var message = document.querySelector('#main-text');
  if (result === 'success') {
    //     // ^ perfection
    message.innerHTML   = 'OK!';
    message.style.color = '#2ED500';
  } else {
    message.innerHTML   = 'ERROR!';
    message.style.color = '#FF0000';
  }
  notify(result, response);
}

/**
 * Prompts a notification
 * @param {String} result   The result, to give an ID to the notification
 * @param {String} response The TEXT to notify
 */
function notify(result, response) {
  // in case of error 'ffhp-error' or success 'ffhp-success'
  var id       = 'ffhp-' + result;
  var opt      = {
                  type: 'basic',
                  title: 'Facebook Find Hidden Pictures',
                  message: response,
                  iconUrl: 'img/128.png'
                };
  var callback = function (id) {
   if (chrome.runtime.lastError) {
     console.error(chrome.runtime.lastError.message);
   }
  };
  chrome.notifications.create(id, opt, callback);
}

/**
 * Redirects to the link to the hidden pictures
 * @param  {String} id The user ID
 * @return {String}    The link
 */
function performRedirect(id) {
  var url = 'https://www.facebook.com/search/' + id + '/photos-of';
  chrome.tabs.update(null, {url: url});
}

/**
 * Main function executed when the user opens the popup
 * It analyzes the tab URL and if it's okay
 * then gets the source of the current page
 * and finds the user ID
 */

function main(tabs) {
  var currentUrl = tabs[0].url;
  // now verify that we are ON Facebook
  // first things first, facebook forces HTTPS and WWW,
  // so the link must start with https://www.facebook.com/
  var start = 'https://www.facebook.com/';
  if (currentUrl.indexOf(start) !== 0) {
    displayResult(
        'error',
        'You must be on www.facebook.com to start!'
      );
    return;
  }
  // remove the url and keep the username:
  var user                   = currentUrl.substr(start.length); // <--semicolon
      user                   = user.trim("\/\\\s\n\0"); // just in case
  var profileWithUserName    = /^([A-Za-z0-9\.]+){4,}/ .test(user);
  var profileWithoutUserName = /profile\.php\?id=[\d]+/.test(user);

  if (! (profileWithUserName || profileWithoutUserName)) {
    displayResult('error', 'Please go to a valid Facebook profile');
    return;
  }
  // now, it can be a 404 page, a page, etc, we can't be sure
  // check the page source for a fullcheck
  // inject a script to get the ID and send it back
  chrome.tabs.executeScript(
    null,
    {
      file: "getUserId.js"
    },
    function () {
      if (chrome.runtime.lastError) {
        alert(chrome.runtime.lastError.message);
        displayResult('error', 'Unexpected error');
      }// end if chrome error
    }// end anon function
  );// end .executeScript function

  // get the ID back and perform the redirect
  chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action === "getId") {
      var result = request.result;
      if (result.success) {
        // delete any notification of error
        chrome.notifications.clear('ffhp-error');
        // success baby
        displayResult('success', 'Eureka!');
        performRedirect(result.response); // the ID
        notify('donate', 'If you love this extension, consider donating!');
      } else {
        displayResult('error', result.response);
      } // endif (id)

    } // endif (request.action=='getId')

  }); // end function to the listener

} // end main function

// -----------------
// execute the main function:

chrome.tabs.query({active: true, lastFocusedWindow: true}, main);