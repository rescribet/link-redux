/* eslint no-magic-numbers: 0 */
import 'babel-polyfill';
import assert from 'assert';
import { mount, shallow } from 'enzyme';
import { describe, it } from 'mocha';
import React from 'react';
import sinon from 'sinon';

import { generateContext } from '../../test/fixtures';
import { LinkedObjectContainer } from './LinkedObjectContainer';
import Type from './Type';

const iri = 'http://example.com/resources/5';

describe('LinkedObjectContainer component', function () {
  it('renders null when type is not present', function() {
    const llo =  sinon.spy();
    const elem = shallow(
      <LinkedObjectContainer
        loadLinkedObject={llo}
        object={iri}
      />,
      generateContext()
    );
    assert.equal(elem.type(), null);
  });

  it('renders the type renderer when an object is present', function () {
    const llo =  sinon.spy();
    const elem = shallow(
      <LinkedObjectContainer
        data={{ '@type': 'http://schema.org/CreativeWork' }}
        loadLinkedObject={llo}
      />
    );
    assert(llo.calledOnce);
    assert.equal(elem.first().type(), Type);
  });

  it('renders children when present', function () {
    const llo =  sinon.spy();
    const elem = shallow(
      <LinkedObjectContainer
        data={{ '@type': 'http://schema.org/CreativeWork' }}
        loadLinkedObject={llo}
      >
        <span>override</span>
      </LinkedObjectContainer>
    );
    assert.equal(llo.callCount, 1);
    assert(elem.first().hasClass('view-overridden'));
  });
});
