require('babel-register')();
const { JSDOM } = require('jsdom');

require.extensions['.scss'] = () => null;

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const exposedProperties = ['window', 'navigator', 'document'];
const { window } = jsdom;

global.window = window;
global.document = window.document;
global.window.fetch = require('whatwg-fetch').fetch;
global.URL = require('whatwg-url').URL;

Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js',
};
