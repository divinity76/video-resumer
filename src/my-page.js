// TODO: make a message-based updateList call instead of setIterval
// 
"use strict";
function updateList() {
  // 1) fetch the list of URLs (now stored as an array)
  chrome.storage.local.get("video_urls", function ({ video_urls }) {
    let urls = Array.isArray(video_urls) ? video_urls.slice() : [];

    // default example if empty
    if (urls.length === 0) {
      urls = ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"];
    }

    // 2) build a list of all the per-URL keys we need
    const storageKeys = urls.map((url) => "video_" + url);

    // 3) fetch every "video_<url>" in one go
    chrome.storage.local.get(storageKeys, function (allData) {
      // map URL → its metadata object
      const urlDataMap = {};
      urls.forEach((url) => {
        const key = "video_" + url;
        let meta = allData[key];

        // if this is our default example, inject its metadata
        if (!meta && url === "https://www.youtube.com/watch?v=dQw4w9WgXcQ") {
          meta = {
            title: "PSY - GANGNAM STYLE(강남스타일) M/V",
            date_updated: 1633131480000
          };
        }

        // ensure we at least have an object
        urlDataMap[url] = meta || {};
      });

      // 4) sort URLs by their date_updated (descending)
      urls.sort((a, b) => {
        const da = urlDataMap[a].date_updated || 0;
        const db = urlDataMap[b].date_updated || 0;
        return db - da;
      });

      // 5) clear out the existing list
      const videolist = document.getElementById("videolist");
      videolist.innerHTML = "";

      // 6) render each URL’s entries
      urls.forEach((url) => {
        const meta = urlDataMap[url];
        const { title = "Untitled", date_updated } = meta;
        const dateString = date_updated
          ? new Date(date_updated).toISOString()
          : "unknown date";

        // extract only numeric keys (the saved times)
        const timeKeys = Object.keys(meta).filter(
          (k) => k !== "title" && k !== "date_updated"
        );
        let li = null;
        if (timeKeys.length === 0) {
          // no saved progress
          li = document.createElement("li");
          const a = document.createElement("a");
          a.href = url;
          a.innerText = `${title}: no times saved (${dateString})`;
          li.appendChild(a);
          videolist.appendChild(li);
        } else {
          // render one <li> per saved timestamp
          timeKeys.forEach((key) => {
            const seconds = meta[key];
            const timeString = new Date(seconds * 1000)
              .toISOString()
              .substr(11, 8);
            li = document.createElement("li");
            const a = document.createElement("a");
            a.href = url;
            a.innerText = `${title}: ${timeString} (${dateString}) ${url}`;
            li.appendChild(a);
            videolist.appendChild(li);
          });
        }
        if (li) {
          // add delete button
          const deleteButton = document.createElement("button");
          deleteButton.innerText = "Delete";
          deleteButton.onclick = function () {
            // delete the video data
            chrome.storage.local.remove("video_" + url).then(() => {
              // remove the URL from the list
              chrome.storage.local.get("video_urls", function ({ video_urls }) {
                const index = video_urls.indexOf(url);
                if (index !== -1) {
                  video_urls.splice(index, 1);
                  chrome.storage.local.set({ video_urls }).then(() => {
                    //
                  });
                }
                // remove the list item
                videolist.removeChild(li);
                updateList();
              });
            });
          };
          li.appendChild(deleteButton);
        }
      });
    });
  });
}
updateList();
setInterval(updateList, 3000); 