// TODO: make a message-based updateList call instead of setIterval
// 
function updateList() {
  chrome.storage.local.get("videos", function (result) {
    let videos = result.videos;
    if (!videos || Object.keys(videos).length == 0) {
      videos = {
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ": {
          "title": "PSY - GANGNAM STYLE(강남스타일) M/V",
          "date_updated": 1633131480000,
          "0": 1.23
        }
      };
    };
    let videolist = document.getElementById("videolist");
    while (videolist.lastChild) {
      videolist.removeChild(videolist.lastChild);
    }
    let urls = Object.keys(videos);
    // sort by videos[url].date_updated
    urls.sort((a, b) => {
      // Math.sign(a-b) is a spaseship-operator alternative for JavaScript
      return Math.sign(videos[b].date_updated - videos[a].date_updated);
    });
    for (let i = 0; i < urls.length; ++i) {
      let url = urls[i];
      let video = videos[url];
      Object.keys(video).forEach((key) => {
        if (key == "title" || key == "date_updated") {
          return;
        }
        let li = document.createElement("li");
        let a = document.createElement("a");
        a.href = url;
        let seconds = video[key];
        // seconds to hh:mm:ss
        let timeString = new Date(seconds * 1000).toISOString().substr(11, 8);
        let dateString = new Date(video.date_updated).toISOString();
        a.innerText = video.title + ": " + timeString + " (" + dateString + ")";
        li.appendChild(a);
        videolist.appendChild(li);
      });
    };
  });
};
updateList();
setInterval(updateList, 3000); // TODO this should be an event listener, not a setInterval
