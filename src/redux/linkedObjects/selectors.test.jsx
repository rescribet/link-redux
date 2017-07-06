/* eslint no-magic-numbers: 0 */
import 'babel-polyfill';
import assert from 'assert';
import Immutable from 'immutable';
import { describe, it } from 'mocha';

import { selectLinkedObject, linkedObjectByIRI } from './selectors';

const rawState = {
  linkedObjects: {
    items: {
      'http://example.com/resource/1': {
        'http://schema.org/name': {
          '@value': 'Name',
        },
        'http://www.w3.org/2002/07/owl#sameAs': {
          '@id': 'http://example.com/resource/2',
        },
      },
      'http://example.com/resource/2': {
        'http://www.w3.org/2002/07/owl#sameAs': {
          '@id': 'http://example.com/resource/3',
        },
      },
      'http://example.com/resource/3': {
        'http://schema.org/thumbnail': {
          '@value': 'http://example.com/images/1',
        },
      },
    },
  },
};
const state = Immutable.fromJS(rawState);

describe('linkedObjects selector', () => {
  describe('linkedObjectByIRI', () => {
    it('selects a resource', () => {
      const obj = linkedObjectByIRI(state, 'http://example.com/resource/1');
      assert.equal('Name', obj.getIn(['http://schema.org/name', '@value']));
    });
  });

  describe('selectLinkedObject', () => {
    it('selects the correct resource', () => {
      const obj = selectLinkedObject(state, { object: 'http://example.com/resource/1' });
      assert.equal(obj.getIn(['http://schema.org/name', '@value']), 'Name');
    });

    it('deeply merges sameAs declarations', () => {
      const obj = selectLinkedObject(state, { object: 'http://example.com/resource/1' });
      assert.equal(obj.getIn(['http://schema.org/thumbnail', '@value']), 'http://example.com/images/1');
    });
  });
});
