'use strict';

function log() {
    const debug = false;
    if (debug) {
        console.log(...arguments);
    }
}
function getUrl() {
    let url = window.location.href;
    if (url.includes('youtube.com/')) {
        // https://www.youtube.com/live/PzMx13ZjhyU?t=9386s
        // https://www.youtube.com/watch?v=PzMx13ZjhyU&t=9386s
        // https://www.youtube.com/watch?app=desktop&v=8YMgD5GSIK8&t=49s
        // https://www.youtube.com/watch?v=8YMgD5GSIK8&t=49s
        if (url.includes('youtube.com/live/')) {
            const tmp = /\/live\/(?<youtube_id>[a-zA-Z0-9]+)/.exec(url)?.groups?.youtube_id;
            if (tmp) {
                url = 'https://www.youtube.com/watch?v=' + tmp;
            }
        } else if (url.includes('youtube.com/watch?')) {
            const tmp = /[?&]v=(?<youtube_id>[a-zA-Z0-9]+)/.exec(url)?.groups?.youtube_id;
            if (tmp) {
                url = 'https://www.youtube.com/watch?v=' + tmp;
            }
        }
    }
    return url;
}

function think2() {
    if (document.readyState !== 'complete') {
        return;
    }
    const videos = [...document.getElementsByTagName('video')];
    if (videos.length == 0) {
        return;
    }
    const url = getUrl();
    const interestingVideoData = {};
    let shouldDelete = 0;
    videos.forEach((videoElement, videoIndex) => {
        // ignore short videos
        if (isNaN(videoElement.duration) || isNaN(videoElement.currentTime) || videoElement.duration < 20) {
            return;
        }
        // <resume>
        if (
            videoElement.currentTime < 10 &&
            videoElement.dataset.videoResumerProbed != 'true'
        ) {
            chrome.storage.local.get("video_" + url, function (data) {
                data = data?.["video_" + url];
                log('resuming', data, url, videoElement.currentTime);
                const resumeTime = data?.[videoIndex] ?? undefined;
                if (resumeTime > 0) {
                    videoElement.currentTime = resumeTime;
                }
            });
            videoElement.dataset.videoResumerProbed = 'true';
        }
        // </resume>
        if (videoElement.currentTime < 10) {
            // on Firefox Android, currentTime randomly reset to 0 after switching tabs
            // javascript setInterval() still runs but .currentTime is 0 o.0
            // regardless, no need to save <10s progress
            return;
        }
        const remainingTime = videoElement.duration - videoElement.currentTime;
        if (remainingTime < 10) {
            ++shouldDelete;
            // no need to save progress if video is almost done
            return;
        }
        interestingVideoData[videoIndex] = videoElement.currentTime;
    });
    // presumably faster than if (Object.keys(interestingVideoData).length === 0) return;
    let hasProperties = false;
    for (const _ in interestingVideoData) {
        hasProperties = true;
        break;
    }
    if (!hasProperties && shouldDelete === 0) {
        // no interesting videos
        return;
    }
    const newJson = JSON.stringify(interestingVideoData);
    if (think2.lastJson === newJson) {
        // no changes
        return;
    }
    think2.lastJson = newJson;
    interestingVideoData["title"] = document.title;
    interestingVideoData["date_updated"] = Date.now();
    if (url !== think2.lastUrl || shouldDelete === videos.length) {
        think2.lastUrl = url;
        chrome.storage.local.get("video_urls", function (video_urls) {
            video_urls = video_urls?.video_urls;
            if (!Array.isArray(video_urls)) {
                log('video_urls is not an array', video_urls);
                video_urls = []; // wtf..
            }
            const index = video_urls.indexOf(url);
            if (index !== -1) {
                if (shouldDelete === videos.length) {
                    // delete url
                    video_urls.splice(index, 1);
                } else {
                    // it exist and should not be deleted, do nothing
                    return;
                }
            } else if (shouldDelete === videos.length) {
                // url does not exist and should be deleted, also do nothing
                return;
            }
            video_urls.push(url);
            chrome.storage.local.set({ "video_urls": video_urls }).then(() => {
                //log('saved', video_urls);
            });
        });
    }
    if (shouldDelete === videos.length) {
        // delete video data
        chrome.storage.local.remove("video_" + url).then(() => {
            //log('deleted', url);
        });
        return;
    } else {
        // save video data
        chrome.storage.local.set({ ["video_" + url]: interestingVideoData }).then(() => {
            //log('saved', interestingVideoData);
        });
    }
}
setInterval(think2, 3000);
