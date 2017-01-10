import React, { PropTypes } from 'react';
import { getP, getValueOrID } from 'link-lib';

import PropertyBase from './PropertyBase';

const propTypes = {
  forceRender: PropTypes.bool,
};

/**
 * Picks the best view for the given objects' property
 *
 * @param {Object} object The resource of which the property is rendered
 *
 * @param {String} property The property to be rendered
 */
class Property extends PropertyBase {
  getLinkedObjectClass() {
    return this.context.linkedRenderStore.getRenderClassForProperty(
      getValueOrID(getP(this.context.schemaObject, '@type')),
      this.expandedProperty(),
      this.context.topology
    );
  }

  render() {
    const { forceRender } = this.props;
    const obj = this.getLinkedObjectProperty();
    if (obj === undefined && !forceRender) {
      return null;
    }
    const Klass = this.getLinkedObjectClass();
    if (Klass) {
      return <Klass {...this.props} />;
    }
    if (obj) {
      return (<div>{obj}</div>);
    }
    return null;
  }
}

Property.contextTypes = {
  linkedRenderStore: PropTypes.object,
  schemaObject: PropTypes.object,
  topology: PropTypes.string,
};
Property.propTypes = propTypes;

export default Property;
