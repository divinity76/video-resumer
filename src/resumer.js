'use strict';
function log() {
    const debug = false;
    if (debug) {
        console.log(...arguments);
    }
}
function storeVideoData(videoElement, videoIndex) {
    let url = window.location.href;
    chrome.storage.local.get("videos", function (data) {
        data = data["videos"] ?? {};
        if ((videoElement.duration - videoElement.currentTime) < 10) {
            // video is almost done, delete resume time
            delete data[url]?.[videoIndex];
            if (Object.keys(data[url] ?? {}).length == 2) {
                // no more videos left, delete url
                delete data[url];
            }
        } else {
            data[url] = data[url] ?? {};
            data[url]["title"] = document.title;
            data[url]["date_updated"] = Date.now();
            data[url][videoIndex] = videoElement.currentTime;
            chrome.storage.local.set({ "videos": data }).then(() => {
                log('saved', data);
            });
        }
    });
    return;
}
function think() {
    log('thinking');
    if (document.readyState !== 'complete') {
        return;
    }
    const url = window.location.href;
    [...document.getElementsByTagName('video')].forEach((videoElement, videoIndex) => {
        // skip if total duration is less than 10 seconds
        if (videoElement.duration < 10) {
            return;
        }
        if (videoElement.currentTime < 10) {
            // on Firefox Android, currentTime randomly reset to 0 after switching tabs
            // javascript still runs but .currentTime is 0 o.0
            return;
        }
        if (
            videoElement.getAttribute('data-video-resumer-probed') != 'true' &&
            videoElement.currentTime < 10) {
            chrome.storage.local.get("videos", function (data) {
                let resumeTime = data?.["videos"]?.[url]?.[videoIndex] || undefined;
                log('resumeTime', resumeTime);
                if (resumeTime > 0) {
                    log('resuming', resumeTime);
                    videoElement.currentTime = resumeTime;
                }
            });
            videoElement.setAttribute('data-video-resumer-probed', 'true');
        }
        storeVideoData(videoElement, videoIndex);
    });
}
setInterval(think, 3000);
