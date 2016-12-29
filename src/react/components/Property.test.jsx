/* eslint no-magic-numbers: 0 */
import 'babel-polyfill';
import assert from 'assert';
import { mount, shallow } from 'enzyme';
import { describe, it } from 'mocha';
import React from 'react';

import { generateContext, linkedRenderStore } from '../../../test/fixtures';
import Property from './Property';

const context = (so) => generateContext({ linkedRenderStore: true, schemaObject: so || true });

describe('Property component', function () {
  it('renders null when label is not present', function() {
    assert.equal(shallow(<Property />, context()).type(), null);
  });

  it('renders null when the given property is not present', function() {
    const elem = shallow(
      <Property label="schema:title"/>,
      context({ '@type': 'https://argu.co/ns/core#Challenge' })
    );
    assert.equal(elem.type(), null);
  });

  it('renders the value when no view is registered', function() {
    const title = 'The title';
    const elem = shallow(
      <Property label="schema:name"/>,
      context({
        '@type': 'https://argu.co/ns/core#Challenge',
        'http://schema.org/name': title
      })
    );
    assert.equal(elem.first().text(), title);
  });

  it('renders the view', function() {
    linkedRenderStore.registerRenderer(
      a => <div className="nameProp" />,
      'http://schema.org/Thing',
      'schema:name'
    );
    const title = 'The title';
    const elem = mount(
      <Property label="http://schema.org/name" />,
      generateContext({
        linkedRenderStore,
        schemaObject: {
        '@type': 'https://argu.co/ns/core#Challenge',
        'http://schema.org/name': title
      }})
    );
    assert(elem.hasClass('nameProp'));
  });
});
