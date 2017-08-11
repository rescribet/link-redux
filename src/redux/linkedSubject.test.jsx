/* eslint no-magic-numbers: 0 */
import 'babel-polyfill';
import { shallow } from 'enzyme';
import { describe, it } from 'mocha';
import React from 'react';

import { chai } from '../test/utilities';
import * as ctx from '../test/fixtures';
import linkedSubject from './linkedSubject';

const { expect } = chai;


global.HTMLElement = () => {};

describe('linkedSubject component', function () {
  it('sets the inner subject type', function() {
    const Comp = linkedSubject(() => {});
    expect(Comp).to.have.property('contextTypes');
    expect(Comp.contextTypes).to.have.property('subject');
  });

  it('sets the inner display name', function() {
    const Comp = linkedSubject(() => {});
    expect(Comp).to.have.property('displayName', 'linkedSubject');
  });

  it('adds the subject', function() {
    const Comp = linkedSubject(() => <p>test</p>);
    const opts = ctx.empty();
    const elem = shallow(
      <Comp />,
      opts,
    );
    expect(elem).to.have.prop('subject', opts.context.subject);
  });
});
