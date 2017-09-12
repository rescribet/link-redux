/* eslint no-magic-numbers: 0 */
import 'babel-polyfill';
import { shallow } from 'enzyme';
import { describe, it } from 'mocha';
import React from 'react';

import { chai, generateContext, generateStore } from '../../test/utilities';
import * as ctx from '../../test/fixtures';
import linkedVersion from './linkedVersion';
import { linkedModelTouch } from './linkedObjects/actions';

const { expect } = chai;

global.HTMLElement = () => {};

describe('linkedVersion component', function () {
  it('raises without subject', function() {
    const Comp = linkedVersion(() => {});
    let caught = false;
    try {
      shallow(
        <Comp />,
        generateContext({ store: generateStore() })
      );
    } catch (e) {
      caught = true;
    }
    expect(caught).to.equal(true);
  });

  it('does not raise with a subject', function() {
    const Comp = linkedVersion(() => {});
    let caught = false;
    try {
      shallow(
        <Comp subject="http://example.org/1" />,
        generateContext({ store: generateStore() })
      );
    } catch (e) {
      caught = true;
    }
    expect(caught).to.equal(false);
  });

  it('adds the version', function() {
    const Comp = linkedVersion(() => <p>test</p>);
    const opts = ctx.empty('0', true);
    const subject = opts.context.subject;
    const action = linkedModelTouch([subject]);
    opts.context.store.dispatch(action);
    const elem = shallow(
      <Comp subject={opts.context.subject} />,
      opts,
    );
    expect(elem.first()).to.have.prop('version', action.payload[opts.context.subject]);
  });
});
