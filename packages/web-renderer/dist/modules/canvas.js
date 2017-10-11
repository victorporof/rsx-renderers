'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pixi = require('pixi.js');

var PIXI = _interopRequireWildcard(_pixi);

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var _renderer = require('./renderer');

var _renderer2 = _interopRequireDefault(_renderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class Renderer extends _renderer2.default {
  constructor({
    deviceWidth = window.innerWidth,
    deviceHeight = window.innerHeight,
    devicePixelRatio = window.devicePixelRatio,
    backgroundColor = '#fff',
    preventWebGL = false
  } = {}) {
    const view = document.createElement('canvas');
    view.style.width = '100%';
    view.style.height = '100%';
    super(view);

    this.app = new PIXI.Application(deviceWidth, deviceHeight, {
      view: this.view,
      resolution: devicePixelRatio,
      backgroundColor: (0, _color2.default)(backgroundColor).rgbNumber(),
      forceCanvas: preventWebGL
    });
  }

  appendRect({ bounds: { position, size }, display: { color } }) {
    const { left, top } = position;
    const { width, height } = size;
    const {
      red, green, blue, alpha
    } = color;

    const node = new PIXI.Graphics();
    node.beginFill(_color2.default.rgb(red, green, blue).rgbNumber(), alpha / 255);
    node.drawRect(left, top, width, height);
    node.endFill();

    this.app.stage.addChild(node);
  }

  appendBorder({ bounds: { position, size }, display: { colors, widths } }) {
    const { left, top } = position;
    const { width, height } = size;
    const [tw, rw, bw, lw] = widths;
    const [{
      red: tr, green: tg, blue: tb, alpha: ta
    }, {
      red: rr, green: rg, blue: rb, alpha: ra
    }, {
      red: br, green: bg, blue: bb, alpha: ba
    }, {
      red: lr, green: lg, blue: lb, alpha: la
    }] = colors;

    {
      const node = new PIXI.Graphics();
      node.lineStyle(tw, _color2.default.rgb(tr, tg, tb).rgbNumber(), ta / 255);
      node.moveTo(left, top);
      node.lineTo(left + width, top);
      this.app.stage.addChild(node);
    }
    {
      const node = new PIXI.Graphics();
      node.lineStyle(rw, _color2.default.rgb(rr, rg, rb).rgbNumber(), ra / 255);
      node.moveTo(left + width, top);
      node.lineTo(left + width, top + height);
      this.app.stage.addChild(node);
    }
    {
      const node = new PIXI.Graphics();
      node.lineStyle(bw, _color2.default.rgb(br, bg, bb).rgbNumber(), ba / 255);
      node.moveTo(left, top + height);
      node.lineTo(left + width, top + height);
      this.app.stage.addChild(node);
    }
    {
      const node = new PIXI.Graphics();
      node.lineStyle(lw, _color2.default.rgb(lr, lg, lb).rgbNumber(), la / 255);
      node.moveTo(left, top);
      node.lineTo(left, top + height);
      this.app.stage.addChild(node);
    }
  }

  appendImage({ bounds: { position, size }, display: { measured_image: image } }) {
    const { left, top } = position;
    const { width, height } = size;

    const node = PIXI.Sprite.fromImage(this.images.get(image.image_key));
    node.x = left;
    node.y = top;
    node.width = width;
    node.height = height;

    this.app.stage.addChild(node);
  }

  appendText({ bounds: { position }, display: { color, shaped_text: textRun, source_text: textContent } }) {
    const { left, top } = position;
    const {
      red, green, blue, alpha
    } = color;

    const fontInstance = this.fontInstances.get(textRun.font_instance_key);

    const style = new PIXI.TextStyle({
      fontFamily: `"${fontInstance.fontKey}"`,
      fontSize: fontInstance.fontSize,
      fill: [_color2.default.rgb(red, green, blue).alpha(alpha / 255).rgbNumber()]
    });

    // FIXME: print shaped text instead of source text.
    const node = new PIXI.Text(textContent.Static || textContent.Owned, style);
    node.x = left;
    node.y = top;

    this.app.stage.addChild(node);
  }
} /*
  Copyright 2016 Mozilla
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software distributed
  under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
  CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
  */

/* eslint no-cond-assign: "off" */

exports.default = Renderer;
//# sourceMappingURL=canvas.js.map
