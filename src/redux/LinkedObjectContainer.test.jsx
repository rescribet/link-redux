/* eslint no-magic-numbers: 0 */
import 'babel-polyfill';
import { mount, shallow } from 'enzyme';
import { defaultNS, RENDER_CLASS_NAME } from 'link-lib';
import { describe, it } from 'mocha';
import React from 'react';
import sinon from 'sinon';

import { chai } from '../../test/utilities';
import * as ctx from '../../test/fixtures';
import { LinkedObjectContainer } from './LinkedObjectContainer';

const { expect } = chai;

const id = 'resources/5';
const iri = 'http://example.org/' + id;

describe('LinkedObjectContainer component', function () {
  it('renders null when type is not present', function() {
    const elem = shallow(
      <LinkedObjectContainer loadLinkedObject={() => {}} object={iri} />,
      ctx.empty(id),
    );
    expect(elem).to.have.type(null);
  });

  it('loads the reference when no data is present', function () {
    const llo = sinon.spy();
    shallow(
      <LinkedObjectContainer loadLinkedObject={llo} object={iri} />,
      ctx.empty(id),
    );
    expect(llo).to.be.calledOnce;
  });

  it('does not load the reference when data is present', function () {
    const llo = sinon.spy();
    shallow(
      <LinkedObjectContainer object={iri} loadLinkedObject={llo} />,
      ctx.fullCW(id),
    );
    expect(llo).to.not.be.called;
  });

  it('renders the renderer when an object is present', function () {
    const opts = ctx.fullCW(id);
    const Comp = () => <div label="test" />;
    opts.context.linkedRenderStore.registerRenderer(Comp, defaultNS.schema('Thing'));
    const elem = mount(
      <LinkedObjectContainer loadLinkedObject={() => {}} object={iri} />,
      opts,
    );
    expect(elem).to.contain(Comp());
  });

  it('renders children when present', function () {
    const elem = mount(
      <LinkedObjectContainer
        data={{ '@type': 'http://schema.org/CreativeWork' }}
        loadLinkedObject={() => {}}
        object={iri}
      >
        <span>override</span>
      </LinkedObjectContainer>,
      ctx.fullCW(id),
    );
    expect(elem).to.have.className('view-overridden');
  });

  it('renders correct topology through children', function() {
    const opts = ctx.multipleCW(id, { second: { id: 'resources/10' } }, true);
    opts.context.linkedRenderStore.registerRenderer(
      () => <div className="normalRendered" />,
      defaultNS.schema('CreativeWork')
    );
    opts.context.linkedRenderStore.registerRenderer(
      () => <div className="collectionRendered" />,
      defaultNS.schema('CreativeWork'),
      RENDER_CLASS_NAME,
      defaultNS.argu('collection')
    );

    const elem = mount(
      <LinkedObjectContainer
        loadLinkedObject={() => {}}
        object={iri}
        topology={defaultNS.argu('collection')}
      >
        <LinkedObjectContainer
          loadLinkedObject={() => {}}
          object={iri}
        >
          <LinkedObjectContainer
            loadLinkedObject={() => {}}
            object={'http://example.org/resources/10'}
          />
        </LinkedObjectContainer>
      </LinkedObjectContainer>,
      opts,
    );
    expect(
      elem
        .children().first()
        .children().first()
    ).to.have.className('collectionRendered');
  });

  it('renders default topology through children', function() {
    const opts = ctx.multipleCW(id, { second: { id: 'resources/10' } }, true);
    opts.context.linkedRenderStore.registerRenderer(
      () => <div className="normalRendered" />,
      defaultNS.schema('CreativeWork')
    );
    opts.context.linkedRenderStore.registerRenderer(
      () => <div className="collectionRendered" />,
      defaultNS.schema('CreativeWork'),
      RENDER_CLASS_NAME,
      defaultNS.argu('collection')
    );

    const elem = mount(
      <LinkedObjectContainer
        object={iri}
        loadLinkedObject={() => {}}
      >
        <LinkedObjectContainer
          object={iri}
          loadLinkedObject={() => {}}
        >
          <LinkedObjectContainer
            object={'http://example.org/resources/10'}
            loadLinkedObject={() => {}}
          />
        </LinkedObjectContainer>
      </LinkedObjectContainer>,
      opts,
    );
    expect(
      elem
        .children().first()
        .children().first()
    ).to.have.className('normalRendered');
  });
});
