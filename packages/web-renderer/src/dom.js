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

import Base from './renderer';

class Renderer extends Base {
  constructor() {
    const view = document.createElement('div');
    view.style.position = 'fixed';

    view.ownerDocument.documentElement.addEventListener('wheel', function onWheel() {
      view.ownerDocument.documentElement.removeEventListener('wheen', onWheel);
      view.style.position = 'absolute';
    });

    super(view);
    this._nodes = [];
  }

  appendRect({ bounds: { position, size }, display: { color } }) {
    const { left, top } = position;
    const { width, height } = size;
    const {
      red: r, green: g, blue: b, alpha: a,
    } = color;

    const node = this.view.ownerDocument.createElement('div');
    node.style.left = `${left | 0}px`;
    node.style.top = `${top | 0}px`;
    node.style.width = `${width | 0}px`;
    node.style.height = `${height | 0}px`;
    if ((r || g || b) && a) {
      node.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
    }

    this.view.appendChild(node);
    this._nodes.push({ parented: node });
  }

  appendBorder({ bounds: { position, size }, display: { colors, widths, styles } }) {
    const { left, top } = position;
    const { width, height } = size;
    const [tw, rw, bw, lw] = widths;
    const [ts, rs, bs, ls] = styles;
    const [{
      red: tr, green: tg, blue: tb, alpha: ta,
    }, {
      red: rr, green: rg, blue: rb, alpha: ra,
    }, {
      red: br, green: bg, blue: bb, alpha: ba,
    }, {
      red: lr, green: lg, blue: lb, alpha: la,
    }] = colors;

    const node = this.view.ownerDocument.createElement('div');
    node.style.boxSizing = 'border-box';
    node.style.left = `${left | 0}px`;
    node.style.top = `${top | 0}px`;
    node.style.width = `${width | 0}px`;
    node.style.height = `${height | 0}px`;
    node.style.borderTop = `${tw}px ${ts} rgba(${tr}, ${tg}, ${tb}, ${ta / 255})`;
    node.style.borderRight = `${rw}px ${rs} rgba(${rr}, ${rg}, ${rb}, ${ra / 255})`;
    node.style.borderBottom = `${bw}px ${bs} rgba(${br}, ${bg}, ${bb}, ${ba / 255})`;
    node.style.borderLeft = `${lw}px ${ls} rgba(${lr}, ${lg}, ${lb}, ${la / 255})`;

    this.view.appendChild(node);
    this._nodes.push({ parented: node });
  }

  appendImage({ bounds: { position, size }, display: { measured_image: image } }) {
    const { left, top } = position;
    const { width, height } = size;

    const node = this.view.ownerDocument.createElement('img');
    node.style.left = `${left | 0}px`;
    node.style.top = `${top | 0}px`;
    node.style.width = `${width | 0}px`;
    node.style.height = `${height | 0}px`;
    node.src = this.images.get(image.image_key);

    this.view.appendChild(node);
    this._nodes.push({ parented: node });
  }

  appendText({ bounds: { position, size }, display: { color, shaped_text: textRun, source_text: textContent } }) {
    const { left, top } = position;
    const { width, height } = size;
    const {
      red: r, green: g, blue: b, alpha: a,
    } = color;

    const fontInstance = this.fontInstances.get(textRun[0].font_instance_key);
    const node = this.view.ownerDocument.createElement('pre');
    node.style.left = `${left | 0}px`;
    node.style.top = `${top | 0}px`;
    node.style.width = `${width | 0}px`;
    node.style.height = `${height | 0}px`;
    node.style.fontFamily = `"${fontInstance.fontKey}"`;
    node.style.fontSize = `${fontInstance.fontSize}px`;
    if ((r || g || b) && a) {
      node.style.color = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
    }

    // FIXME: print shaped text instead of source text.
    const textString = textContent.map(v => v.Owned || v.Static).join('');
    node.textContent = textString;

    if (textString.trim()) {
      this.view.appendChild(node);
      this._nodes.push({ parented: node });
    } else {
      this._nodes.push({ orphan: node });
    }
  }

  changeBounds(index, {
    X: left, Y: top, W: width, H: height,
  }) {
    const node = this._nodes[index].parented;

    if (left !== undefined) {
      node.style.left = `${left | 0}px`;
    } else if (top !== undefined) {
      node.style.top = `${top | 0}px`;
    } else if (width !== undefined) {
      node.style.width = `${width | 0}px`;
    } else if (height !== undefined) {
      node.style.height = `${height | 0}px`;
    }
  }

  changeText(index, { T: textContent }) {
    const node = this._nodes[index];

    if (node.orphan) {
      node.orphan.textContent = textContent;
      this.view.appendChild(node.orphan);
      this._nodes[index] = { parented: node.orphan };
    } else {
      node.parented.textContent = textContent;
    }
  }
}

export default Renderer;
