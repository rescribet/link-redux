import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';
import sinonChai from 'sinon-chai';
import LinkedRenderStore from 'link-lib';
import { PropTypes } from 'react';
import { applyMiddleware, createStore } from 'redux';
import { combineReducers } from 'redux-immutable';

import { linkMiddleware, linkReducer } from '../src/index';

chai.use(chaiEnzyme());
chai.use(sinonChai);

export const generateStore = lrs => createStore(
  combineReducers({ linkedObjects: linkReducer }),
  applyMiddleware(linkMiddleware(lrs)),
);

const lrs = LinkedRenderStore;
const contextDefaults = {
  linkedRenderStore: lrs,
  schemaObject: {},
  store: generateStore(lrs),
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

const store = generateStore();

export {
  chai,
  generateContext,
  LinkedRenderStore as linkedRenderStore,
  store,
};
