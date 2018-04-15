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
import Deferred from './deferred';
import Base from './renderer';

const SERVER = 'ws://localhost:6767';
const BROWSER = detect();

const WINDOW_X_OFFSET = {
  chrome: 0,
  firefox: 0,
  safari: 0,
  opera: 68,
}[BROWSER.name] || 0;

const WINDOW_Y_OFFSET = {
  chrome: 75,
  firefox: 75,
  safari: 60,
  opera: 95,
}[BROWSER.name] || 0;

const WIDTH_MOD = 0;
const HEIGHT_MOD = -50;

class Renderer extends Base {
  constructor() {
    const view = document.createElement('div');
    view.style.position = 'fixed';
    super(view);

    setInterval(() => Renderer.sendWinMetadata([view.offsetLeft, view.offsetTop]), 5000);
  }

  static ws() {
    if (Renderer._ws) {
      return Renderer._ws;
    }

    const deferred = new Deferred();
    Renderer._ws = deferred.promise;

    const ws = new WebSocket(SERVER);
    ws.onopen = () => deferred.resolve(ws);

    return Renderer._ws;
  }

  static sendClearEvent() {
    Renderer.ws().then(ws => ws.send(`{ "clear": ${true} }`));
  }

  static sendWinMetadata(anchor) {
    Renderer.sendPosition(anchor);
    Renderer.sendSize(anchor);
  }

  static sendPosition(anchor = [0, 0], x = window.screenX + WINDOW_X_OFFSET, y = window.screenY + WINDOW_Y_OFFSET) {
    const currPosition = `[${(x + anchor[0]) | 0}, ${(y + anchor[1]) | 0}]`;
    Renderer.ws().then(ws => ws.send(`{ "position": ${currPosition} }`));
  }

  static sendSize(anchor = [0, 0], width = window.innerWidth, height = window.innerHeight) {
    const currSize = `[${((width - anchor[0]) + WIDTH_MOD) | 0}, ${((height - anchor[1]) + HEIGHT_MOD) | 0}]`;
    Renderer.ws().then(ws => ws.send(`{ "size": ${currSize} }`));
  }

  static insertResourceUpdates(resourceUpdatesJson) {
    if (resourceUpdatesJson !== '[]') {
      Renderer.ws().then(ws => ws.send(`{ "resources": ${resourceUpdatesJson} }`));
    }
  }

  static applyDisplayListDiff(displayListDiffJson) {
    if (displayListDiffJson !== '[]') {
      Renderer.ws().then(ws => ws.send(`{ "render": ${displayListDiffJson} }`));
    }
  }
}

export default Renderer;
