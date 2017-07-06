/* eslint no-magic-numbers: 0 */
import 'babel-polyfill';
import assert from 'assert';
import { mount, shallow } from 'enzyme';
import { describe, it } from 'mocha';
import { RENDER_CLASS_NAME } from 'link-lib';
import React from 'react';
import sinon from 'sinon';

import { generateContext, linkedRenderStore } from '../test/utilities';
import { LinkedObjectContainer } from './LinkedObjectContainer';
import Type from './Type';

const context = (so) => generateContext({ linkedRenderStore: true, schemaObject: so || true });

const iri = 'http://example.com/resources/5';

describe('LinkedObjectContainer component', function () {
  it('renders null when type is not present', function() {
    const llo =  sinon.spy();
    const elem = shallow(
      <LinkedObjectContainer
        loadLinkedObject={llo}
        object={iri}
      />,
      context()
    );
    assert.equal(elem.type(), null);
  });

  it('renders the type renderer when an object is present', function () {
    const llo =  sinon.spy();
    const elem = shallow(
      <LinkedObjectContainer
        data={{ '@type': 'http://schema.org/CreativeWork' }}
        object={iri}
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
        object={iri}
        loadLinkedObject={llo}
      >
        <span>override</span>
      </LinkedObjectContainer>
    );
    assert.equal(llo.callCount, 1);
    assert(elem.first().hasClass('view-overridden'));
  });

  it('passes the topology through children', function() {
    linkedRenderStore.reset();
    linkedRenderStore.registerRenderer(
      () => <div className="normalRendered" />,
      'http://schema.org/CreativeWork'
    );
    linkedRenderStore.registerRenderer(
      () => <div className="collectionRendered" />,
      'http://schema.org/CreativeWork',
      RENDER_CLASS_NAME,
      'argu:collection'
    );

    const llo =  sinon.spy();
    const elem = mount(
      <LinkedObjectContainer
        data={{ '@type': 'http://schema.org/CreativeWork' }}
        object={iri}
        loadLinkedObject={llo}
        topology="argu:collection"
      >
        <LinkedObjectContainer
          data={{ '@type': 'http://schema.org/CreativeWork' }}
          object={iri}
          loadLinkedObject={llo}
        >
          <LinkedObjectContainer
            data={{ '@type': 'http://schema.org/CreativeWork' }}
            object={'http://example.com/resources/10'}
            loadLinkedObject={llo}
          />
        </LinkedObjectContainer>
      </LinkedObjectContainer>,
      context()
    );
    assert(elem
      .children().first()
      .children().first()
      .hasClass('collectionRendered'));
  });

  it('passes the topology through children', function() {
    linkedRenderStore.reset();
    linkedRenderStore.registerRenderer(
      () => <div className="normalRendered" />,
      'http://schema.org/CreativeWork'
    );
    linkedRenderStore.registerRenderer(
      () => <div className="collectionRendered" />,
      'http://schema.org/CreativeWork',
      RENDER_CLASS_NAME,
      'argu:collection'
    );

    const llo =  sinon.spy();
    const elem = mount(
      <LinkedObjectContainer
        data={{ '@type': 'http://schema.org/CreativeWork' }}
        object={iri}
        loadLinkedObject={llo}
      >
        <LinkedObjectContainer
          data={{ '@type': 'http://schema.org/CreativeWork' }}
          object={iri}
          loadLinkedObject={llo}
        >
          <LinkedObjectContainer
            data={{ '@type': 'http://schema.org/CreativeWork' }}
            object={'http://example.com/resources/10'}
            loadLinkedObject={llo}
          />
        </LinkedObjectContainer>
      </LinkedObjectContainer>,
      context()
    );
    assert(elem
      .children().first()
      .children().first()
      .hasClass('normalRendered'));
  });
});
