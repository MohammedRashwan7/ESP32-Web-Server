/**canvas*/
(function($) { var Canvas = function(cls, container) { var element = container.getElementsByClassName(cls)[0]; if (!element) { element = document.createElement('canvas');
            element.className = cls;
            element.style.direction = 'ltr';
            element.style.position = 'absolute';
            element.style.left = '0px';
            element.style.top = '0px';
            container.appendChild(element); if (!element.getContext) { throw new Error('Canvas is not available.'); } }
        this.element = element; var context = this.context = element.getContext('2d');
        this.pixelRatio = $.plot.browser.getPixelRatio(context); var width = $(container).width(); var height = $(container).height();
        this.resize(width, height);
        this.SVGContainer = null;
        this.SVG = {};
        this._textCache = {}; }
    Canvas.prototype.resize = function(width, height) { var minSize = 10;
        width = width < minSize ? minSize : width;
        height = height < minSize ? minSize : height; var element = this.element,
            context = this.context,
            pixelRatio = this.pixelRatio; if (this.width !== width) { element.width = width * pixelRatio;
            element.style.width = width + 'px';
            this.width = width; } if (this.height !== height) { element.height = height * pixelRatio;
            element.style.height = height + 'px';
            this.height = height; }
        context.restore();
        context.save();
        context.scale(pixelRatio, pixelRatio); };
    Canvas.prototype.clear = function() { this.context.clearRect(0, 0, this.width, this.height); };
    Canvas.prototype.render = function() { var cache = this._textCache; for (var layerKey in cache) { if (hasOwnProperty.call(cache, layerKey)) { var layer = this.getSVGLayer(layerKey),
                    layerCache = cache[layerKey]; var display = layer.style.display;
                layer.style.display = 'none'; for (var styleKey in layerCache) { if (hasOwnProperty.call(layerCache, styleKey)) { var styleCache = layerCache[styleKey]; for (var key in styleCache) { if (hasOwnProperty.call(styleCache, key)) { var val = styleCache[key],
                                    positions = val.positions; for (var i = 0, position; positions[i]; i++) { position = positions[i]; if (position.active) { if (!position.rendered) { layer.appendChild(position.element);
                                            position.rendered = true; } } else { positions.splice(i--, 1); if (position.rendered) { while (position.element.firstChild) { position.element.removeChild(position.element.firstChild); }
                                            position.element.parentNode.removeChild(position.element); } } } if (positions.length === 0) { if (val.measured) { val.measured = false; } else { delete styleCache[key]; } } } } } }
                layer.style.display = display; } } };
    Canvas.prototype.getSVGLayer = function(classes) { var layer = this.SVG[classes]; if (!layer) { var svgElement; if (!this.SVGContainer) { this.SVGContainer = document.createElement('div');
                this.SVGContainer.className = 'flot-svg';
                this.SVGContainer.style.position = 'absolute';
                this.SVGContainer.style.top = '0px';
                this.SVGContainer.style.left = '0px';
                this.SVGContainer.style.height = '100%';
                this.SVGContainer.style.width = '100%';
                this.SVGContainer.style.pointerEvents = 'none';
                this.element.parentNode.appendChild(this.SVGContainer);
                svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svgElement.style.width = '100%';
                svgElement.style.height = '100%';
                this.SVGContainer.appendChild(svgElement); } else { svgElement = this.SVGContainer.firstChild; }
            layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            layer.setAttribute('class', classes);
            layer.style.position = 'absolute';
            layer.style.top = '0px';
            layer.style.left = '0px';
            layer.style.bottom = '0px';
            layer.style.right = '0px';
            svgElement.appendChild(layer);
            this.SVG[classes] = layer; } return layer; };
    Canvas.prototype.getTextInfo = function(layer, text, font, angle, width) { var textStyle, layerCache, styleCache, info;
        text = '' + text; if (typeof font === 'object') { textStyle = font.style + ' ' + font.variant + ' ' + font.weight + ' ' + font.size + 'px/' + font.lineHeight + 'px ' + font.family; } else { textStyle = font; }
        layerCache = this._textCache[layer]; if (layerCache == null) { layerCache = this._textCache[layer] = {}; }
        styleCache = layerCache[textStyle]; if (styleCache == null) { styleCache = layerCache[textStyle] = {}; } var key = generateKey(text);
        info = styleCache[key]; if (!info) { var element = document.createElementNS('http://www.w3.org/2000/svg', 'text'); if (text.indexOf('<br>') !== -1) { addTspanElements(text, element, -9999); } else { var textNode = document.createTextNode(text);
                element.appendChild(textNode); }
            element.style.position = 'absolute';
            element.style.maxWidth = width;
            element.setAttributeNS(null, 'x', -9999);
            element.setAttributeNS(null, 'y', -9999); if (typeof font === 'object') { element.style.font = textStyle;
                element.style.fill = font.fill; } else if (typeof font === 'string') { element.setAttribute('class', font); }
            this.getSVGLayer(layer).appendChild(element); var elementRect = element.getBBox();
            info = styleCache[key] = { width: elementRect.width, height: elementRect.height, measured: true, element: element, positions: [] }; while (element.firstChild) { element.removeChild(element.firstChild); }
            element.parentNode.removeChild(element); }
        info.measured = true; return info; };

    function updateTransforms(element, transforms) { element.transform.baseVal.clear(); if (transforms) { transforms.forEach(function(t) { element.transform.baseVal.appendItem(t); }); } }
    Canvas.prototype.addText = function(layer, x, y, text, font, angle, width, halign, valign, transforms) { var info = this.getTextInfo(layer, text, font, angle, width),
            positions = info.positions; if (halign === 'center') { x -= info.width / 2; } else if (halign === 'right') { x -= info.width; } if (valign === 'middle') { y -= info.height / 2; } else if (valign === 'bottom') { y -= info.height; }
        y += 0.75 * info.height; for (var i = 0, position; positions[i]; i++) { position = positions[i]; if (position.x === x && position.y === y && position.text === text) { position.active = true;
                updateTransforms(position.element, transforms); return; } else if (position.active === false) { position.active = true;
                position.text = text; if (text.indexOf('<br>') !== -1) { y -= 0.25 * info.height;
                    addTspanElements(text, position.element, x); } else { position.element.textContent = text; }
                position.element.setAttributeNS(null, 'x', x);
                position.element.setAttributeNS(null, 'y', y);
                position.x = x;
                position.y = y;
                updateTransforms(position.element, transforms); return; } }
        position = { active: true, rendered: false, element: positions.length ? info.element.cloneNode() : info.element, text: text, x: x, y: y };
        positions.push(position); if (text.indexOf('<br>') !== -1) { y -= 0.25 * info.height;
            addTspanElements(text, position.element, x); } else { position.element.textContent = text; }
        position.element.setAttributeNS(null, 'x', x);
        position.element.setAttributeNS(null, 'y', y);
        position.element.style.textAlign = halign;
        updateTransforms(position.element, transforms); }; var addTspanElements = function(text, element, x) { var lines = text.split('<br>'),
            tspan, i, offset; for (i = 0; i < lines.length; i++) { if (!element.childNodes[i]) { tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                element.appendChild(tspan); } else { tspan = element.childNodes[i]; }
            tspan.textContent = lines[i];
            offset = i * 1 + 'em';
            tspan.setAttributeNS(null, 'dy', offset);
            tspan.setAttributeNS(null, 'x', x); } }
    Canvas.prototype.removeText = function(layer, x, y, text, font, angle) { var info, htmlYCoord; if (text == null) { var layerCache = this._textCache[layer]; if (layerCache != null) { for (var styleKey in layerCache) { if (hasOwnProperty.call(layerCache, styleKey)) { var styleCache = layerCache[styleKey]; for (var key in styleCache) { if (hasOwnProperty.call(styleCache, key)) { var positions = styleCache[key].positions;
                                positions.forEach(function(position) { position.active = false; }); } } } } } } else { info = this.getTextInfo(layer, text, font, angle);
            positions = info.positions;
            positions.forEach(function(position) { htmlYCoord = y + 0.75 * info.height; if (position.x === x && position.y === htmlYCoord && position.text === text) { position.active = false; } }); } };
    Canvas.prototype.clearCache = function() { var cache = this._textCache; for (var layerKey in cache) { if (hasOwnProperty.call(cache, layerKey)) { var layer = this.getSVGLayer(layerKey); while (layer.firstChild) { layer.removeChild(layer.firstChild); } } };
        this._textCache = {}; };

    function generateKey(text) { return text.replace(/0|1|2|3|4|5|6|7|8|9/g, '0'); } if (!window.Flot) { window.Flot = {}; }
    window.Flot.Canvas = Canvas; })(jQuery); /**color*/
(function($) { $.color = {};
    $.color.make = function(r, g, b, a) { var o = {};
        o.r = r || 0;
        o.g = g || 0;
        o.b = b || 0;
        o.a = a != null ? a : 1;
        o.add = function(c, d) { for (var i = 0; i < c.length; ++i) { o[c.charAt(i)] += d; } return o.normalize(); };
        o.scale = function(c, f) { for (var i = 0; i < c.length; ++i) { o[c.charAt(i)] *= f; } return o.normalize(); };
        o.toString = function() { if (o.a >= 1.0) { return "rgb(" + [o.r, o.g, o.b].join(",") + ")"; } else { return "rgba(" + [o.r, o.g, o.b, o.a].join(",") + ")"; } };
        o.normalize = function() {
            function clamp(min, value, max) { return value < min ? min : (value > max ? max : value); }
            o.r = clamp(0, parseInt(o.r), 255);
            o.g = clamp(0, parseInt(o.g), 255);
            o.b = clamp(0, parseInt(o.b), 255);
            o.a = clamp(0, o.a, 1); return o; };
        o.clone = function() { return $.color.make(o.r, o.b, o.g, o.a); }; return o.normalize(); }
    $.color.extract = function(elem, css) { var c;
        do { c = elem.css(css).toLowerCase(); if (c !== '' && c !== 'transparent') { break; }
            elem = elem.parent(); } while (elem.length && !$.nodeName(elem.get(0), "body")); if (c === "rgba(0, 0, 0, 0)") { c = "transparent"; } return $.color.parse(c); }
    $.color.parse = function(str) { var res, m = $.color.make; /** Look for #a0b1c2*/
        res = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(str); if (res) { return m(parseInt(res[1], 16), parseInt(res[2], 16), parseInt(res[3], 16)); } /** Look for #fff*/
        res = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(str); if (res) { return m(parseInt(res[1] + res[1], 16), parseInt(res[2] + res[2], 16), parseInt(res[3] + res[3], 16)); } var name = $.trim(str).toLowerCase(); if (name === "transparent") { return m(255, 255, 255, 0); } else { res = lookupColors[name] || [0, 0, 0]; return m(res[0], res[1], res[2]); } }
    var lookupColors = { green: [0, 128, 0], black: [0, 0, 0], blue: [0, 0, 255], }; })(jQuery);