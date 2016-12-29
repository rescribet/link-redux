import LinkedRenderStore from 'link-lib';
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
    context: {},
  };
  keys.forEach((key) => {
    if (properties[key] === true) {
      c.context[key] = contextDefaults[key];
    } else if (properties[key] !== undefined) {
      c.context[key] = properties[key];
    }
  });
  return c;
}

export {
  generateContext,
  LinkedRenderStore as linkedRenderStore,
  store,
};
