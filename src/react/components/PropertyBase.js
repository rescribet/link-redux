import {
  allRDFPropertyTriples,
} from 'link-lib';
import React, { PropTypes } from 'react';

const LANG_PREF = ['nl', 'en', 'de'];

const propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  linkedProp: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ]),
  version: PropTypes.string,
};

function getPropBestLang(rawProp) {
  if (!Array.isArray(rawProp)) {
    return rawProp.object;
  }
  if (rawProp.length === 1) {
    return rawProp[0].object;
  }
  for (let i = 0; i < LANG_PREF.length; i++) {
    const pIndex = rawProp.findIndex(p => p.object.lang === LANG_PREF[i]);
    if (pIndex >= 0) {
      return rawProp[pIndex].object;
    }
  }
  return rawProp[0].object;
}

export function expandedProperty(prop, linkedRenderStore) {
  if (Array.isArray(prop)) {
    return prop.map(p => linkedRenderStore.expandProperty(p));
  }
  return linkedRenderStore.expandProperty(prop);
}

export function getLinkedObjectPropertyRaw(property, subject, linkedRenderStore) {
  const props = linkedRenderStore.tryEntity(subject);
  if (Array.isArray(property)) {
    for (let i = 0; i < property.length; i++) {
      const values = allRDFPropertyTriples(props, property[i], true);
      if (typeof values !== 'undefined') return values;
    }
    return undefined;
  }
  return allRDFPropertyTriples(props, property, true);
}

export function getLinkedObjectProperty(property, subject, linkedRenderStore, term = false) {
  const rawProp = getLinkedObjectPropertyRaw(property, subject, linkedRenderStore, term);
  if (rawProp === undefined) {
    return undefined;
  }
  const val = getPropBestLang(rawProp);

  if (term) return val;
  return val && val.constructor !== Object &&
    (val.href || val.value || val.toString());
}

export const contextTypes = {
  linkedRenderStore: PropTypes.object,
  subject: PropTypes.object,
};

class PropertyBase extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (nextProps.label === undefined) {
      return false;
    }
    return this.props.version !== nextProps.version ||
      this.props.subject !== nextProps.subject;
  }

  getLinkedObjectProperty(property) {
    if (property === undefined && typeof this.props.linkedProp !== 'undefined') {
      return this.props.linkedProp;
    }
    return getLinkedObjectProperty(
      property || this.props.label,
      this.props.subject,
      this.context.linkedRenderStore,
    );
  }

  getLinkedObjectPropertyRaw(property) {
    return getLinkedObjectPropertyRaw(
      property || this.props.label,
      this.props.subject,
      this.context.linkedRenderStore,
    );
  }

  expandedProperty(property) {
    return expandedProperty(property || this.props.label, this.context.linkedRenderStore);
  }

  render() {
    return React.createElement(
      'span',
      null,
      'PropBase: ',
      this.getLinkedObjectProperty(),
    );
  }
}

PropertyBase.contextTypes = contextTypes;
PropertyBase.propTypes = propTypes;

export default PropertyBase;
