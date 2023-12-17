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
        data = data["videos"] || {};
        data[url] = data[url] || {};
        data[url]["title"] = document.title;
        data[url]["date_updated"] = Date.now();
        data[url][videoIndex] = videoElement.currentTime;
        chrome.storage.local.set({ "videos": data }).then(() => {
            log('saved', data);
        });
    });
    return;
}
function think() {
    log('thinking');
    if (document.readyState !== 'complete') {
        return;
    }
    let url = window.location.href;
    let videos = [...document.getElementsByTagName('video')];
    videos.forEach((videoElement, videoIndex) => {
        // skip if total duration is less than 10 seconds
        if (videoElement.duration < 10) {
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
