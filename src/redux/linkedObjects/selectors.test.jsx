/* eslint no-magic-numbers: 0 */
import 'babel-polyfill';
import Immutable from 'immutable';
import { describe, it } from 'mocha';
import rdf from 'rdflib';

import { chai } from '../../test/utilities';
import { linkedObjectVersionByIRI } from './selectors';

const { expect } = chai;

const ns = rdf.Namespace('http://example.org/');

const state = new Immutable.Map().set(
  'linkedObjects',
  {
    [ns('resource/1').toString()]: '6qqyb',
  },
);

describe('linkedObjects selector', () => {
  describe('linkedObjectVersionByIRI', () => {
    it('returns the version', () => {
      expect(linkedObjectVersionByIRI(state, ns('resource/1'))).to.equal('6qqyb');
    });
  });
});
