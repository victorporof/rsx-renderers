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

import FontFaceObserver from 'fontfaceobserver';

class Renderer {
  constructor(view) {
    this.images = new Map();
    this.fonts = new Map();
    this.fontInstances = new Map();
    this.view = view;
  }

  _unimplemented() {
    throw new Error(this);
  }

  _unsupported() {
    throw new Error(this);
  }

  insertCommonStyle() {
    const document = this.view.ownerDocument;
    const style = document.createElement('style');
    style.type = 'text/css';

    this.view.parentNode.insertBefore(style, this.view.parentNode.firstChild);
    style.appendChild(document.createTextNode(`
      * {
        position: absolute;
        pointer-events: none;
      }
      pre {
        pointer-events: auto;
        margin: 0;
      }`));
  }

  insertFontFaceStyle(fontKey, dataUri) {
    const document = this.view.ownerDocument;
    const style = document.createElement('style');
    style.type = 'text/css';

    document.getElementsByTagName('head')[0].appendChild(style);
    style.appendChild(document.createTextNode(`
      @font-face {
        font-family: "${fontKey}";
        src: url(${dataUri});
      }`));

    const font = new FontFaceObserver(`${fontKey}`);
    return font.load();
  }

  insertResourceUpdates(resourceUpdatesJson) {
    const outstanding = [];

    JSON.parse(resourceUpdatesJson).forEach((update) => {
      let resource;
      if (resource = update.AddImage) {
        const { key: imageKey, data_uri: imageDataUri } = resource;
        this.images.set(imageKey, imageDataUri);
      } else if (resource = update.AddFont) {
        const { key: fontKey, data_uri: fontDataUri } = resource;
        this.fonts.set(fontKey, fontDataUri);
        outstanding.push(this.insertFontFaceStyle(fontKey, fontDataUri));
      } else if (resource = update.AddFontInstance) {
        const { key: fontKey, instance_key: fontInstanceKey, size: fontSize } = resource;
        this.fontInstances.set(fontInstanceKey, { fontKey, fontSize });
      }
    });

    return Promise.all(outstanding);
  }

  applyDisplayListDiff(displayListDiffJson) {
    JSON.parse(displayListDiffJson).forEach((diff) => {
      let update;
      if (update = diff.M) {
        const [index, changes] = update;
        changes.forEach((change) => {
          let specific;
          if (specific = change.T) {
            this.changeText(index, specific);
          } else if (specific = change.I) {
            // TODO
          } else if (specific = change.B) {
            // TODO
          } else if (specific = change.R) {
            // TODO
          } else if (specific = change.Z) {
            this.changeBounds(index, specific);
          }
        });
      } else if (update = diff.D) {
        // TODO
      } else if (update = diff.AddRect) {
        this.appendRect(update);
      } else if (update = diff.AddBorder) {
        this.appendBorder(update);
      } else if (update = diff.AddImage) {
        this.appendImage(update);
      } else if (update = diff.AddText) {
        this.appendText(update);
      }
    });
  }

  mount(parentNode) {
    const shadow = parentNode.attachShadow({ mode: 'closed' });
    shadow.appendChild(this.view);
    this.insertCommonStyle();
  }

  draw(resourceUpdates, displayListDiff) {
    const outstanding = [];
    if (resourceUpdates.length) {
      outstanding.push(this.insertResourceUpdates(resourceUpdates));
    }
    if (displayListDiff.length) {
      outstanding.push(this.applyDisplayListDiff(displayListDiff));
    }
    return Promise.all(outstanding);
  }
}

export default Renderer;
