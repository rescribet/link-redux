/* eslint no-magic-numbers: 0 */
import 'babel-polyfill';
import assert from 'assert';
import { mount, shallow } from 'enzyme';
import { describe, it } from 'mocha';
import React from 'react';

import { generateContext, linkedRenderStore } from '../test/utilities';
import Type from './Type';

const context = (so) => generateContext({ linkedRenderStore: true, schemaObject: so || true });

describe('Type component', function () {
  it('renders null when type is not present', function() {
    const d = linkedRenderStore.defaultType;
    linkedRenderStore.defaultType = undefined;
    const elem = shallow(
      <Type />,
      context()
    );
    assert.equal(elem.type(), null);
    linkedRenderStore.defaultType = d;
  });

  it('renders no view when no class matches', function () {
    linkedRenderStore.reset();
    const elem = mount(
      <Type />,
      context({ '@type': 'https://argu.co/ns/core#Challenge' })
    );
    assert(elem.first().hasClass('no-view'));
  });

  it('renders default when set', function() {
    linkedRenderStore.registerRenderer(a => <div className="thing" />, 'schema:Thing');
    const elem = mount(
      <Type />,
      context()
    );
    assert(elem.first().hasClass('thing'));
  });

  it('renders the registered class', function () {
    linkedRenderStore.registerRenderer(a => <div className="thing" />, 'schema:CreativeWork');
    const elem = mount(
      <Type />,
      context({ '@type': 'http://schema.org/CreativeWork' })
    );
    assert(elem.first().hasClass('thing'));
  });
});
