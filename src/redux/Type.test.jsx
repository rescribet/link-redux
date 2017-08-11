/* eslint no-magic-numbers: 0 */
import 'babel-polyfill';
import { mount, shallow } from 'enzyme';
import { defaultNS } from 'link-lib';
import { describe, it } from 'mocha';
import React from 'react';

import * as ctx from '../test/fixtures';
import { chai } from '../test/utilities';
import Type from './Type';

const { expect } = chai;

describe('Type component', function () {
  it('renders null when type is not present', function() {
    const opts = ctx.empty();
    opts.context.linkedRenderStore.defaultType = undefined;
    const elem = shallow(<Type />, opts);
    expect(elem).to.be.blank();
  });

  it('renders no view when no class matches', function () {
    const opts = ctx.empty(undefined, true);
    const elem = mount(<Type />, opts);
    expect(elem).to.have.className('no-view');
  });

  it('renders default when set', function() {
    const opts = ctx.type(undefined, true);
    opts.context.linkedRenderStore.registerRenderer(
      () => <div className="thing" />,
      defaultNS.schema('Thing')
    );
    const elem = mount(<Type />, opts);
    expect(elem).to.have.className('thing');
  });

  it('renders the registered class', function () {
    const opts = ctx.type(undefined, true);
    opts.context.linkedRenderStore.registerRenderer(
      () => <div className="creativeWork" />,
      defaultNS.schema('CreativeWork')
    );
    const elem = mount(<Type />, opts);
    expect(elem).to.have.className('creativeWork');
  });
});
