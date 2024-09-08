/*
Open a new tab, and load "my-page.html" into it.
*/
function openMyPage() {
  //console.log("injecting");
  if (chrome.tabs) {
    // for chromium
    chrome.tabs.create({
      "url": "/my-page.html"
    });
  } else {
    // for firefox
    browser.tabs.create({
      "url": "/my-page.html"
    });
  }
}


/*
Add openMyPage() as a listener to clicks on the browser action.
*/

if (typeof browser !== 'undefined' && browser.browserAction && browser.browserAction.onClicked) {
  // presumably firefox-based browser
  browser.browserAction.onClicked.addListener(openMyPage);
} else {
  // assume chromium-compatible browser
  chrome.action.onClicked.addListener(openMyPage);
}