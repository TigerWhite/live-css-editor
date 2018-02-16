/*globals jQuery, less, Sass, csspretty */

'use strict';

var utils = window.utils || {};

if (!utils.defined) {
    utils.defined = true;

    utils.attachPublishSubscribe = function (attachToObject) {
        var o = jQuery({});
        jQuery.each({
            trigger: 'publish',
            on: 'subscribe',
            off: 'unsubscribe'
        }, function (key, val) {
            attachToObject[val] = function () {
                o[key].apply(o, arguments);
            };
        });
    };

    utils.gEBI = function (id) {
        return document.getElementById(id);
    };

    utils.gEBTN = function (tagName) {
        return document.getElementsByTagName(tagName);
    };

    /**
     * Load a script
     *
     * @param {Object|string} cfg Configuration object or Path of the JS source
     * @param {Document} [cfg.doc=document] Which "document" object to use
     * @param {String} [cfg.parent='body'] Which tag to append to (the "parent" tag value would be used if that element is available)
     * @param {String} cfg.src Path of the JS source
     * @param {Boolean} [cfg.freshCopy=true] Load a fresh JS source
    */
    utils.loadScript = function (cfg) {
        var doc = cfg.doc || document,
            parent = (function () {
                var parent = cfg.parent || 'body';
                if (parent === 'html') {
                    return 'documentElement';
                } else if (parent === 'head') {
                    return 'head';
                } else {
                    return 'body';
                }
            }()),
            parentEl = doc[parent] || doc['body'] || doc['head'] || doc['documentElement'],
            src = (cfg.src || cfg),
            freshCopy = (cfg.freshCopy === false) ? false : true,
            script = doc.createElement('script');
        script.src = src + (freshCopy ? '' : ('?' + Math.random()));
        parentEl.appendChild(script);
    };

    /*
    Parameters:
        config.cssText (required): The CSS style
        config.doc (optional): Which "document" object to use
        config.id (optional): ID attribute for the style tag
        config.parentTag (optional): 'body' (default) or 'head' or 'html' (the "parentTag" value would be used if that element is available)
        config.overwriteExistingStyleTagWithSameId: Overwrite definition of existing style tag with same id, true or false (default)
        config.removeExistingStyleTagWithSameId (optional): true or false (default),
            applicable only if "id" parameter is also specified
    */
    utils.addStyleTag = function (config) {
        var doc = config.doc || document,
            id = config.id;
        if (id) {
            var removeExistingStyleTag = config.removeExistingStyleTagWithSameId;
            if (removeExistingStyleTag === true) {
                var existingStyleTag = utils.gEBI(id);
                existingStyleTag.parentNode.removeChild(existingStyleTag);
            }
        }

        var overwriteExistingStyleTag = config.overwriteExistingStyleTagWithSameId,
            styleNode;
        if (overwriteExistingStyleTag && id) {
            styleNode = utils.gEBI(id);
        }
        if (styleNode) {
            // do nothing
        } else {
            styleNode = doc.createElement('style');
            styleNode.type = 'text/css';
            if (id) {
                styleNode.id = id;
            }
        }
        var attributes = config.attributes || [];
        attributes.forEach(function (attribute) {
            styleNode.setAttribute(attribute.name, attribute.value);
        });

        var cssText = config.cssText;
        styleNode.innerHTML = '';
        styleNode.appendChild(doc.createTextNode(cssText));

        var parent = (function () {
            var parentTag = config.parentTag || 'body';
            if (parentTag === 'html') {
                return 'documentElement';
            } else if (parentTag === 'head') {
                return 'head';
            } else {
                return 'body';
            }
        }());
        var parentEl = doc[parent] || doc['body'] || doc['head'] || doc['documentElement'];

        parentEl.appendChild(styleNode);

        var disabled = config.disabled;
        if (disabled) {
            styleNode.disabled = true;
        } else {
            styleNode.disabled = false;
        }
    };

    utils.StyleTag = function (config) {
        this.cssText = config.cssText;
        this.id = config.id;
        this.parentTag = config.parentTag;
        this.overwriteExistingStyleTagWithSameId = config.overwriteExistingStyleTagWithSameId;
        this.removeExistingStyleTagWithSameId = config.removeExistingStyleTagWithSameId;

        var proto = utils.StyleTag.prototype;
        if (typeof proto.firstExecution == 'undefined') {
            proto.firstExecution = true;

            proto.applyTag = function (cb) {
                utils.addStyleTag({
                    attributes: config.attributes,
                    cssText: this.cssText,
                    id: this.id,
                    parentTag: this.parentTag,
                    overwriteExistingStyleTagWithSameId: this.overwriteExistingStyleTagWithSameId,
                    removeExistingStyleTagWithSameId: this.removeExistingStyleTagWithSameId,
                    disabled: this.disabled
                });
                cb && cb(this.cssText);
            };

            proto.disable = function () {
                // TODO
            };
        } else {
            proto.firstExecution = false;
        }
    };

    // http://james.padolsey.com/javascript/javascript-comment-removal-revisted/
    utils.removeComments = function (str) {
        var uid = '_' + (+new Date()),
            primatives = [],
            primIndex = 0;

        return (
            str
                /* Remove strings */
                .replace(/(['"])(\\\1|.)+?\1/g, function(match){
                    primatives[primIndex] = match;
                    return (uid + '') + primIndex++;
                })

                /* Remove Regexes */
                .replace(/([^/])(\/(?!\*|\/)(\\\/|.)+?\/[gim]{0,3})/g, function(match, $1, $2){
                    primatives[primIndex] = $2;
                    return $1 + (uid + '') + primIndex++;
                })

                /*
                - Remove single-line comments that contain would-be multi-line delimiters
                    E.g. // Comment /* <--
                - Remove multi-line comments that contain would be single-line delimiters
                    E.g. /* // <--
               */
                .replace(/\/\/.*?\/?\*.+?(?=\n|\r|$)|\/\*[\s\S]*?\/\/[\s\S]*?\*\//g, '')

                /*
                Remove single and multi-line comments,
                no consideration of inner-contents
               */
                .replace(/\/\/.+?(?=\n|\r|$)|\/\*[\s\S]+?\*\//g, '')

                /*
                Remove multi-line comments that have a replaced ending (string/regex)
                Greedy, so no inner strings/regexes will stop it.
               */
                .replace(RegExp('\\/\\*[\\s\\S]+' + uid + '\\d+', 'g'), '')

                /* Bring back strings & regexes */
                .replace(RegExp(uid + '(\\d+)', 'g'), function(match, n){
                    return primatives[n];
                })
        );
    };

    utils.delayFunctionUntilTestFunction = function(config) {
        var fnSuccess = config.fnSuccess,
            fnTest = config.fnTest,
            fnFirstFailure = config.fnFirstFailure,
            fnEachFailure = config.fnEachFailure,
            fnFailure = config.fnFailure,
            tryLimit = typeof config.tryLimit === 'undefined' ? 120 : config.tryLimit;

        config['tryLimit-Running-Cycle-Number'] = typeof config['tryLimit-Running-Cycle-Number'] === 'undefined' ? 0 : config['tryLimit-Running-Cycle-Number']+1;

        var tryLimitRunningCycleNumber = config['tryLimit-Running-Cycle-Number'],
            waitFor = config.waitFor || 750;

        if(fnTest()) {
            return fnSuccess() === false ? false : true;
        } else {
            if(tryLimitRunningCycleNumber === 0 && typeof fnFirstFailure === 'function') {
                fnFirstFailure();
            }

            if(typeof fnEachFailure === 'function') {
                fnEachFailure();
            }

            if(tryLimitRunningCycleNumber < (tryLimit-1)) {
                window.setTimeout((function(){
                    utils.delayFunctionUntilTestFunction(config);
                }),waitFor);
            } else {
                if (typeof fnFailure === 'function') {
                    fnFailure();
                }
            }
            return false;
        }
    };

    utils.alertNote = (function () {
        var w = window,
            d = document,
            dE = d.documentElement,
            div = d.createElement('div'),
            t;
        div.id = 'topCenterAlertNote';

        // Hide functionality
        var h = function (div) {
            div.style.display = 'none';
        };

        var clearTimeout = function () {
            w.clearTimeout(t);
        };

        var alertNote = function (msg, hideDelay, options) {
            options = options || {};
            var alignment = options.alignment || 'center',
                margin = options.margin || '0 10px',
                opacity = options.opacity || '1';
            // TODO:
            // - Apply !important for various inline styles (otherwise, it might get over-ridden by some previously present !important CSS styles)
            // - "OK" button functionality

            /*eslint-disable indent */
            div.innerHTML = [
                '<div style="position:fixed;left:0;top:0;width:100%;text-align:' + alignment + ';height:0;z-index:2147483647;opacity:' + opacity + ';">',
                                                                                         // margin:0 is useful for some sites (eg: https://developer.chrome.com/home)
                    '<table style="display:inline-table;border-collapse:collapse;width:auto;margin:0"><tr><td style="padding:0px;border:0">',
                                                        // background-color:#feb;
                        '<div style="border:1px solid #eb7;background-color:#f9edbe;margin:' + margin + ';padding:2px 10px;max-width:980px;overflow:hidden;text-align:left;font:bold 13px Arial">',
                            '<div style="clear:both">',
                                '<div style="float:left;color:#000;text-align:' + alignment + ';">',
                                    msg,
                                '</div>',
                                // '<div style="float:right;margin-left:10px;font-weight:normal;text-decoration:underline;cursor:pointer">',
                                //     'OK',
                                // '</div>',
                            '</div>',
                        '</div>',
                    '</td></tr></table>',
                '</div>'
            ].join('');
            /*eslint-enable indent */

            div.style.display = '';     // Required when the same div element is being reused

            dE.appendChild(div);
            clearTimeout();
            t = w.setTimeout(function () { h(div); }, hideDelay || 5000);
        };

        alertNote.hide = function () {
            h(div);
            clearTimeout();
        };

        return alertNote;
    }());

    utils.beautifyCSS = function (cssCode, options) {
        var useTabs = options.useTabs,
            useSpaceCount = options.useSpaceCount;

        var inchar,
            insize;

        if (useTabs) {
            inchar = '\t';
            insize = 1;
        } else {
            inchar = ' ';
            insize = useSpaceCount || 4;
        }

        return csspretty({
            mode: 'beautify',   /* Doing beautify twice, otherwise it doesn't beautify code like the following one in single go:
                                       .box-shadow(@style,@alpha: 50%) when (isnumber(@alpha)){.box-shadow(@style, rgba(0, 0, 0, @alpha))} */
            insize: insize,
            inchar: inchar,
            source: csspretty({
                mode: 'beautify',
                insize: insize,
                inchar: inchar,
                source: cssCode
            })
        });

        // Alternatively, use cssbeautify library:
        //     return cssbeautify(
        //         cssCode,
        //         {
        //             indent: '    ',
        //             autosemicolon: true
        //         }
        //     );
    };

    utils.minifyCSS = function (cssCode) {
        return csspretty({
            mode: 'minify',
            source: cssCode
        });

        // Alternatively, use Yahoo's CSS Min library:
        //     return YAHOO.compressor.cssmin(cssCode);
    };

    utils.sassToCSS = function (sassCode, cb) {
        Sass.compile(sassCode, function (output) {
            if (output.message) {
                cb(output);
            }  else {
                var cssCode = output.text;
                cb(null, cssCode);
            }
        });
    };

    utils.lessToCSS = function (lessCode, cb) {
        less.render(
            lessCode,
            function (err, output) {
                if (err) {
                    cb(err);
                } else {
                    var cssCode = output.css;
                    cb(null, cssCode);
                }
            }
        );

        // With older versions of less:
        //     less.Parser().parse(lessCode, function (err, tree) {
        //         if (err) {
        //             cb(err);
        //         } else {
        //             var cssCode = tree.toCSS();
        //             cb(null, cssCode);
        //         }
        //     });
    };
}

if (!utils.attachPublishSubscribeDone) {
    if (typeof jQuery !== 'undefined') {
        utils.attachPublishSubscribeDone = true;
        utils.attachPublishSubscribe(jQuery);
    }
}
