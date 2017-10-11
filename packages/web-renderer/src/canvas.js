/*
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

import * as PIXI from 'pixi.js';
import Color from 'color';

import Base from './renderer';

class Renderer extends Base {
  constructor({
    deviceWidth = window.innerWidth,
    deviceHeight = window.innerHeight,
    devicePixelRatio = window.devicePixelRatio,
    backgroundColor = '#fff',
    preventWebGL = false,
  } = {}) {
    const view = document.createElement('canvas');
    view.style.width = '100%';
    view.style.height = '100%';
    super(view);

    this.app = new PIXI.Application(deviceWidth, deviceHeight, {
      view: this.view,
      resolution: devicePixelRatio,
      backgroundColor: Color(backgroundColor).rgbNumber(),
      forceCanvas: preventWebGL,
    });
  }

  appendRect({ bounds: { position, size }, display: { color } }) {
    const { left, top } = position;
    const { width, height } = size;
    const {
      red, green, blue, alpha,
    } = color;

    const node = new PIXI.Graphics();
    node.beginFill(Color.rgb(red, green, blue).rgbNumber(), alpha / 255);
    node.drawRect(left, top, width, height);
    node.endFill();

    this.app.stage.addChild(node);
  }

  appendBorder({ bounds: { position, size }, display: { colors, widths } }) {
    const { left, top } = position;
    const { width, height } = size;
    const [tw, rw, bw, lw] = widths;
    const [{
      red: tr, green: tg, blue: tb, alpha: ta,
    }, {
      red: rr, green: rg, blue: rb, alpha: ra,
    }, {
      red: br, green: bg, blue: bb, alpha: ba,
    }, {
      red: lr, green: lg, blue: lb, alpha: la,
    }] = colors;

    {
      const node = new PIXI.Graphics();
      node.lineStyle(tw, Color.rgb(tr, tg, tb).rgbNumber(), ta / 255);
      node.moveTo(left, top);
      node.lineTo(left + width, top);
      this.app.stage.addChild(node);
    }
    {
      const node = new PIXI.Graphics();
      node.lineStyle(rw, Color.rgb(rr, rg, rb).rgbNumber(), ra / 255);
      node.moveTo(left + width, top);
      node.lineTo(left + width, top + height);
      this.app.stage.addChild(node);
    }
    {
      const node = new PIXI.Graphics();
      node.lineStyle(bw, Color.rgb(br, bg, bb).rgbNumber(), ba / 255);
      node.moveTo(left, top + height);
      node.lineTo(left + width, top + height);
      this.app.stage.addChild(node);
    }
    {
      const node = new PIXI.Graphics();
      node.lineStyle(lw, Color.rgb(lr, lg, lb).rgbNumber(), la / 255);
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
      red, green, blue, alpha,
    } = color;

    const fontInstance = this.fontInstances.get(textRun.font_instance_key);

    const style = new PIXI.TextStyle({
      fontFamily: `"${fontInstance.fontKey}"`,
      fontSize: fontInstance.fontSize,
      fill: [Color.rgb(red, green, blue).alpha(alpha / 255).rgbNumber()],
    });

    // FIXME: print shaped text instead of source text.
    const node = new PIXI.Text(textContent.Static || textContent.Owned, style);
    node.x = left;
    node.y = top;

    this.app.stage.addChild(node);
  }
}

export default Renderer;
