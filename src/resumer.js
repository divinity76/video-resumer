'use strict';
function log() {
    const debug = false;
    if (debug) {
        console.log(...arguments);
    }
}
function storeVideoData(videoElement, videoIndex) {
    const url = window.location.href;
    chrome.storage.local.get("videos", function (data) {
        data = data["videos"] ?? {};
        if ((videoElement.duration - videoElement.currentTime) < 10) {
            // video is almost done, delete resume time
            delete data[url]?.[videoIndex];
            // 2= title+date_updated
            if (Object.keys(data[url] ?? {}).length == 2) {
                // no more videos left, delete url
                delete data[url];
            }
        } else {
            data[url] = data[url] ?? {};
            data[url]["title"] = document.title;
            data[url]["date_updated"] = Date.now();
            data[url][videoIndex] = videoElement.currentTime;
        }
        chrome.storage.local.set({ "videos": data }).then(() => {
            log('saved', data);
        });
    });
}
function think() {
    log('thinking');
    if (document.readyState !== 'complete') {
        return;
    }
    const url = window.location.href;
    [...document.getElementsByTagName('video')].forEach((videoElement, videoIndex) => {
        // ignore short videos
        if (videoElement.duration < 10) {
            return;
        }
        if (
            videoElement.getAttribute('data-video-resumer-probed') != 'true' &&
            videoElement.currentTime < 10) {
            chrome.storage.local.get("videos", function (data) {
                const resumeTime = data?.videos?.[url]?.[videoIndex] ?? undefined;
                log('resumeTime', resumeTime);
                if (resumeTime > 0) {
                    log('resuming', resumeTime);
                    videoElement.currentTime = resumeTime;
                }
            });
            videoElement.setAttribute('data-video-resumer-probed', 'true');
        }
        if (videoElement.currentTime < 10) {
            // on Firefox Android, currentTime randomly reset to 0 after switching tabs
            // javascript setInterval() still runs but .currentTime is 0 o.0
            // regardless, no need to save <10s progress
            return;
        }
        storeVideoData(videoElement, videoIndex);
    });
}
setInterval(think, 3000);
