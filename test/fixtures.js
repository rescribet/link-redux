import LinkedRenderStore from 'link-lib';
import { PropTypes } from 'react';
import { applyMiddleware, createStore } from 'redux';

import { linkMiddleware, linkReducer } from '../src/index';

const store = createStore(
  linkReducer,
  applyMiddleware(linkMiddleware),
);

const contextDefaults = {
  linkedRenderStore: LinkedRenderStore,
  schemaObject: {},
  store,
};

function generateContext(properties = {}) {
  const keys = Object.keys(properties);
  const c = {
    childContextTypes: {},
    context: {},
  };
  keys.forEach((key) => {
    if (properties[key] === true) {
      c.context[key] = contextDefaults[key];
      c.childContextTypes[key] = PropTypes.object;
    } else if (properties[key] !== undefined) {
      c.context[key] = properties[key];
      c.childContextTypes[key] = PropTypes.object;
    }
  });
  return c;
}

export {
  generateContext,
  LinkedRenderStore as linkedRenderStore,
  store,
};
