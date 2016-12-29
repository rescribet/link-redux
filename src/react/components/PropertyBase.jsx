import React, { PropTypes } from 'react';
import {
  flattenProperty,
  getValueOrID,
  propertyIncludes,
} from 'link-lib';

const LANG_PREF = ['nl', 'en', 'de'];

const propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
};

function allPropertyTypes(graph, properties) {
  const props = graph
    .filter(obj => propertyIncludes(obj['owl:sameAs'], properties))
    .map(obj => flattenProperty(obj));
  return properties.concat(...props);
}

function getPropBestLang(rawProp) {
  if (!Array.isArray(rawProp)) {
    return getValueOrID(rawProp);
  }
  if (rawProp.length === 1) {
    return getValueOrID(rawProp[0]);
  }
  for (let i = 0; i < LANG_PREF.length; i++) {
    const pIndex = rawProp.findIndex(p => p['@language'] === LANG_PREF[i]);
    if (pIndex >= 0) {
      return getValueOrID(rawProp[pIndex]);
    }
  }
  return getValueOrID(rawProp[0]);
}

class PropertyBase extends React.Component {
  getLinkedObjectPropertyRaw(property) {
    const possibleProperties = allPropertyTypes(
      this.context.linkedRenderStore.schema['@graph'],
      this.expandedProperty(property)
    );
    for (let i = 0; i < possibleProperties.length; i++) {
      const prop = this.context.schemaObject[possibleProperties[i]];
      if (prop) {
        return prop;
      }
    }
    return undefined;
  }

  getLinkedObjectProperty(property) {
    const rawProp = this.getLinkedObjectPropertyRaw(property);
    if (rawProp === undefined) {
      return undefined;
    }
    const val = getPropBestLang(rawProp);
    return val &&
      (Object.keys(val).length !== 0 || val.constructor !== Object) &&
      (val.href || val.toString());
  }

  expandedProperty(property) {
    const prop = property || this.props.label;
    if (Array.isArray(prop)) {
      return prop.map(p => this.context.linkedRenderStore.expandProperty(p));
    }
    return [this.context.linkedRenderStore.expandProperty(prop)];
  }

  render() {
    return (
      <span>
        PropBase: {this.getLinkedObjectProperty()}
      </span>
    );
  }
}

PropertyBase.contextTypes = {
  linkedRenderStore: PropTypes.object,
  schemaObject: PropTypes.object,
};
PropertyBase.propTypes = propTypes;

export default PropertyBase;
