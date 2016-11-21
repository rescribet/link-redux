import React, { PropTypes } from 'react';
import {
  expandProperty,
  flattenProperty,
  propertyIncludes,
  schema
} from 'link-lib';

const LANG_PREF = ['nl', 'en'];

const propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
};

function allPropertyTypes(properties) {
  const props = schema['@graph']
    .filter(obj => propertyIncludes(obj['owl:sameAs'], properties))
    .map(obj => flattenProperty(obj));
  return properties.concat(...props);
}

function getValueOrID(prop) {
  return prop && (prop['@value'] || prop['@id']);
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
    const possibleProperties = allPropertyTypes(this.expandedProperty(property));
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
    if (!rawProp) {
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
      return prop.map(p => expandProperty(p));
    }
    return [expandProperty(prop)];
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
  schemaObject: PropTypes.object,
};
PropertyBase.propTypes = propTypes;

export default PropertyBase;
