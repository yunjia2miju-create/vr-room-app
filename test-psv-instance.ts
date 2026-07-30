import { Viewer } from '@photo-sphere-viewer/core';

// Create a mock DOM element
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>');
global.document = dom.window.document;
global.window = dom.window;

const container = dom.window.document.getElementById('container');
try {
  const viewer = new Viewer({
    container: container,
    panorama: 'https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg',
  });
  console.log("Viewer instance keys:", Object.keys(viewer));
  console.log("addEventListener is function:", typeof viewer.addEventListener === 'function');
  console.log("on is function:", typeof (viewer as any).on === 'function');
  viewer.destroy();
} catch (e) {
  console.error("Error creating Viewer:", e);
}
