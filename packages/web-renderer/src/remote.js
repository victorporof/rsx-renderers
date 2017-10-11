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

import { detect } from 'detect-browser';
import Base from './renderer';

const SERVER = 'http://localhost:6767';
const BROWSER = detect();

const WINDOW_X_OFFSET = {
  chrome: 0,
  firefox: 0,
}[BROWSER.name] || 0;

const WINDOW_Y_OFFSET = {
  chrome: 75,
  firefox: 75,
}[BROWSER.name] || 0;

const WIDTH_MOD = 0;
const HEIGHT_MOD = -50;

class Renderer extends Base {
  constructor() {
    const view = document.createElement('div');
    view.style.position = 'fixed';
    super(view);

    const getAnchor = () => {
      const left = view.offsetLeft | 0;
      const top = view.offsetTop | 0;
      return [left, top];
    };

    const sendWinMetadata = () => {
      Renderer.sendPosition(getAnchor());
      Renderer.sendSize(getAnchor());
    };

    window.addEventListener('beforeunload', () => Renderer.sendClearEvent());
    window.addEventListener('resize', () => sendWinMetadata());
    setInterval(() => sendWinMetadata(), 1000);
  }

  static sendClearEvent() {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${SERVER}/clear`);
    xhr.send();
  }

  static sendPosition(anchor = [0, 0], x = window.screenX + WINDOW_X_OFFSET, y = window.screenY + WINDOW_Y_OFFSET) {
    const currPosition = `[${(x + anchor[0]) | 0}, ${(y + anchor[1]) | 0}]`;
    // if (currPosition === this._prevWinPosition) {
    //   return;
    // }
    // console.log('Sending new window position: ', currPosition);
    this._prevWinPosition = currPosition;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${SERVER}/position`);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.send(currPosition);
  }

  static sendSize(anchor = [0, 0], width = window.innerWidth, height = window.innerHeight) {
    const currSize = `[${((width - anchor[0]) + WIDTH_MOD) | 0}, ${((height - anchor[1]) + HEIGHT_MOD) | 0}]`;
    // if (currSize === this._prevWinSize) {
    //   return;
    // }
    // console.log('Sending new window size: ', currSize);
    this._prevWinSize = currSize;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${SERVER}/size`);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.send(currSize);
  }

  static insertResourceUpdates(resourceUpdatesJson) {
    if (resourceUpdatesJson === '[]') {
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${SERVER}/resources`);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.send(resourceUpdatesJson);
  }

  static applyDisplayListDiff(displayListDiffJson) {
    if (displayListDiffJson === '[]') {
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${SERVER}/render`);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.send(displayListDiffJson);
  }
}

export default Renderer;
