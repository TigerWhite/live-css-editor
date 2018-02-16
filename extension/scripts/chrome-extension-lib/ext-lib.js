/*globals chrome */

// https://github.com/coderaiser/itchy/blob/master/lib/itchy.js
var asyncEachSeries = (array, iterator, done) => {
    check(array, iterator, done);

    var i = -1,
        n = array.length;

    var loop = function (e) {
        i++;

        if (e || i === n)
            return done && done(e);

        iterator(array[i], loop);
    };

    loop();
};

function check(array, iterator, done) {
    if (!Array.isArray(array))
        throw Error('array should be an array!');

    if (typeof iterator !== 'function')
        throw Error('iterator should be a function!');

    if (done && typeof done !== 'function')
        throw Error('done should be a function (when available)!');
}

var extLib = {
    TR: function (key, defaultValue) {
        if (typeof chrome !== "undefined" && chrome && chrome.i18n) {
            return chrome.i18n.getMessage(key);
        } else {
            if (defaultValue) {
                return defaultValue;
            } else {
                console.warn('No default value available for key: ' + key);
                return '';
            }
        }
    },

    loadCSS: function (href) {
        var link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", href);
        // link.onload = function() {
        //     cb();
        // };
        // link.onerror = function() {
        //     cb('Could not load: ' + link);
        // };
        document.body.appendChild(link);
    },

    // allFrames: true
    // to support webpages structured using <frameset> (eg: http://www.w3schools.com/tags/tryhtml_frame_cols.htm)
    insertCSS: function (options, cb) {
        var file = options.file,
            allFrames = options.allFrames === false ? false : true,
            tabId = options.tabId || null;

        if (typeof chrome !== "undefined" && chrome && chrome.tabs) {
            chrome.tabs.insertCSS(tabId, {file: file, allFrames: allFrames}, function () {
                cb();       // Somehow this callback is not getting called without this anonymous function wrapper
            });
        } else {
            extLib.loadCSS(file);
            cb();
            // extLib.loadCSS(file, function (err) {
            //     if (err) {
            //         console.error(err);
            //     } else {
            //         cb();
            //     }
            // });
        }
    },

    loadJS: function(src, cb) {
        cb = cb || function () {};
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = src;
        script.onload = function() {
            cb();
        };
        script.onerror = function() {
            cb('Could not load: ' + src);
        };
        document.body.appendChild(script);
    },

    // allFrames: true
    // to support webpages structured using <frameset> (eg: http://www.w3schools.com/tags/tryhtml_frame_cols.htm)
    executeScript: function (options, cb) {
        var file = options.file,
            allFrames = options.allFrames === false ? false : true,
            tabId = options.tabId || null;
        if (typeof chrome !== "undefined" && chrome && chrome.tabs) {
            chrome.tabs.executeScript(tabId, {file: file, allFrames: allFrames}, function () {
                cb();       // Somehow this callback is not getting called without this anonymous function wrapper
            });
        } else {
            extLib.loadJS(file, function (err) {
                if (err) {
                    console.error(err);
                } else {
                    cb();
                }
            });
        }
    },

    loadJSCSS: function (arrSources, allFrames, tabId) {
        asyncEachSeries(
            arrSources,
            function (source, cb) {
                // source can also be an object and can have "src" and "skip" parameters
                if (typeof source === "object") {
                    if (source.skip) {
                        source = null;
                    } else {
                        source = source.src;
                    }
                }
                if (source) {
                    if (source.match('.js$')) {
                        extLib.executeScript({file: source, allFrames: allFrames, tabId: tabId}, cb);
                    } else if (source.match('.css$')) {
                        extLib.insertCSS({file: source, allFrames: allFrames, tabId: tabId}, cb);
                    } else {
                        console.log('Error - Loading files like ' + source + ' is not supported by loadJSCSS(). Please check the file extension.');
                        cb();
                    }
                } else {
                    cb();
                }
            }
        );
    }
};
