/* eslint no-magic-numbers: 0 */
import 'babel-polyfill';
import { mount } from 'enzyme';
import { defaultNS } from 'link-lib';
import { describe, it } from 'mocha';
import React from 'react';

import * as ctx from '../../../test/fixtures';
import { chai } from '../../../test/utilities';
import { PropertyComp as Property } from './Property';
import { linkedModelTouch } from '../../redux/linkedObjects/actions';

const { expect } = chai;

describe('Property component', function () {
  it('renders null when label is not present', function() {
    expect(mount(<Property />, ctx.empty())).to.be.blank();
  });

  it('renders null when the given property is not present', function() {
    const opts = ctx.fullCW();
    const elem = mount(
      <Property label={defaultNS.schema('title')} subject={opts.context.subject} />,
      opts,
    );
    expect(elem).to.be.blank();
  });

  it('renders the value when no view is registered', function() {
    const title = 'The title';
    const opts = ctx.name(undefined, title);
    const elem = mount(
      <Property label={defaultNS.schema('name')} subject={opts.context.subject} />,
      opts,
    );
    expect(elem.find('div')).to.have.text(title);
  });

  it('renders the view', function() {
    const title = 'The title';
    const opts = ctx.name(undefined, title);
    opts.context.linkedRenderStore.registerRenderer(
      a => <div className="nameProp" />,
      defaultNS.schema('Thing'),
      defaultNS.schema('name'),
    );
    const elem = mount(
      <Property label={defaultNS.schema('name')} subject={opts.context.subject} />,
      opts,
    );
    expect(elem).to.have.className('nameProp');
  });

  it('renders a LOC when rendering a NamedNode', function () {
    const opts = ctx.fullCW(undefined, undefined, true);
    const action = linkedModelTouch([opts.context.subject]);
    opts.context.store.dispatch(action);
    opts.context.linkedRenderStore.loadingComp = () => <p>loading</p>;
    const elem = mount(
      <Property label={defaultNS.schema('author')} subject={opts.context.subject} />,
      opts,
    );
    expect(elem).to.have.text('loading');
  });
});
