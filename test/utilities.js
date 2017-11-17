import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import sinonChai from 'sinon-chai';
import LinkedRenderStore from 'link-lib';
import PropTypes from 'prop-types';
import { applyMiddleware, createStore } from 'redux';
import { combineReducers } from 'redux-immutable';

import { linkMiddleware, linkReducer } from '../src/index';

Enzyme.configure({ adapter: new Adapter() });

chai.use(chaiEnzyme());
chai.use(sinonChai);

export const generateStore = lrs => createStore(
  combineReducers({ linkedObjects: linkReducer }),
  applyMiddleware(linkMiddleware(lrs)),
);

const contextDefaults = () => {
  const lrs = new LinkedRenderStore();
  return {
    linkedRenderStore: lrs,
    schemaObject: {},
    store: generateStore(lrs),
  };
};

function generateContext(properties = {}) {
  const keys = Object.keys(properties);
  const c = {
    childContextTypes: {},
    context: {},
  };
  const defaults = contextDefaults();
  keys.forEach((key) => {
    if (properties[key] === true) {
      c.context[key] = defaults[key];
      c.childContextTypes[key] = PropTypes.object;
    } else if (properties[key] !== undefined) {
      c.context[key] = properties[key];
      c.childContextTypes[key] = PropTypes.object;
    }
  });
  return c;
}

export {
  chai,
  generateContext,
};
