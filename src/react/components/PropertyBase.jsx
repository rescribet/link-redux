import React, { PropTypes } from 'react';
import {
  flattenProperty,
  getP,
  getValueOrID,
  hasP,
  propertyIncludes,
} from 'link-lib';
import { Iterable, Map } from 'immutable';

const LANG_PREF = ['nl', 'en', 'de'];

const propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  linkedProp: PropTypes.object,
};

function allPropertyTypes(graph, properties) {
  const props = graph
    .filter(obj => propertyIncludes(obj['owl:sameAs'], properties))
    .map(obj => flattenProperty(obj));
  return properties.concat(...props);
}

function getPropBestLang(rawProp) {
  if (!Array.isArray(rawProp) && (!Iterable.isIterable(rawProp) || Map.isMap(rawProp))) {
    return getValueOrID(rawProp);
  }
  if (rawProp.length === 1) {
    return getValueOrID(rawProp[0]);
  }
  for (let i = 0; i < LANG_PREF.length; i++) {
    const pIndex = rawProp.findIndex(p => getP(p, '@language') === LANG_PREF[i]);
    if (pIndex >= 0) {
      return getValueOrID(getP(rawProp, pIndex));
    }
  }
  return getValueOrID(getP(rawProp, 0));
}

class PropertyBase extends React.Component {
  getLinkedObjectPropertyRaw(property, schemaObject) {
    const possibleProperties = allPropertyTypes(
      this.context.linkedRenderStore.schema['@graph'],
      this.expandedProperty(property)
    );
    for (let i = 0; i < possibleProperties.length; i++) {
      const prop = getP(schemaObject || this.context.schemaObject, possibleProperties[i]);
      if (prop) {
        return prop;
      }
    }
    return undefined;
  }

  getLinkedObjectProperty(property, schemaObject) {
    if (property === undefined && hasP(this.props, 'linkedProp') && this.props.linkedProp !== undefined) {
      return this.props.linkedProp;
    }
    const rawProp = this.getLinkedObjectPropertyRaw(property, schemaObject);
    if (rawProp === undefined) {
      return undefined;
    }
    const val = getPropBestLang(rawProp);
    return val && val.constructor !== Object &&
      (val.href || getValueOrID(val) || val.toString());
  }

  expandedProperty(property) {
    const prop = property || this.props.label;
    if (Array.isArray(prop)) {
      return prop.map(p => this.context.linkedRenderStore.expandProperty(p));
    }
    return [this.context.linkedRenderStore.expandProperty(prop)];
  }

  shouldComponentUpdate(nextProps, Ignore, nextContext) {
    if (nextProps.label === undefined) {
      return false;
    }
    return this.props.label !== nextProps.label ||
        this.getLinkedObjectProperty(nextProps.label) !==
          this.getLinkedObjectProperty(nextProps.label, nextContext.schemaObject);
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
