/**saturated */
(function($) {
    'use strict';
    var saturated = { saturate: function(a) { if (a === Infinity) { return Number.MAX_VALUE; } if (a === -Infinity) { return -Number.MAX_VALUE; } return a; }, delta: function(min, max, noTicks) { return ((max - min) / noTicks) === Infinity ? (max / noTicks - min / noTicks) : (max - min) / noTicks }, multiply: function(a, b) { return saturated.saturate(a * b); }, multiplyAdd: function(a, bInt, c) { if (isFinite(a * bInt)) { return saturated.saturate(a * bInt + c); } else { var result = c; for (var i = 0; i < bInt; i++) { result += a; } return saturated.saturate(result); } }, floorInBase: function(n, base) { return base * Math.floor(n / base); } };
    $.plot.saturated = saturated;
})(jQuery);
/**uiConstants */
(function($) {
    'use strict';
    $.plot.uiConstants = { SNAPPING_CONSTANT: 20, PANHINT_LENGTH_CONSTANT: 10, MINOR_TICKS_COUNT_CONSTANT: 4, TICK_LENGTH_CONSTANT: 10, ZOOM_DISTANCE_MARGIN: 25 };
})(jQuery);
/**jquery.flot.browser.js */
(function($) {
    'use strict';
    var browser = {
        getPageXY: function(e) {
            var doc = document.documentElement,
                pageX = e.clientX + (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0),
                pageY = e.clientY + (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
            return { X: pageX, Y: pageY };
        },
        getPixelRatio: function(context) {
            var devicePixelRatio = window.devicePixelRatio || 1,
                backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
            return devicePixelRatio / backingStoreRatio;
        },
        isSafari: function() {

            return /constructor/i.test(window.top.HTMLElement) || (function(p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window.top['safari'] || (typeof window.top.safari !== 'undefined' && window.top.safari.pushNotification));
        },
        isMobileSafari: function() { return navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/); },
        isOpera: function() { return (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0; },
        isFirefox: function() { return typeof InstallTrigger !== 'undefined'; },
        isIE: function() { return /*@cc_on!@*/ false || !!document.documentMode; },
        isEdge: function() { return !browser.isIE() && !!window.StyleMedia; },
        isChrome: function() { return !!window.chrome && !!window.chrome.webstore; },
        isBlink: function() { return (browser.isChrome() || browser.isOpera()) && !!window.CSS; }
    };
    $.plot.browser = browser;
})
(jQuery);