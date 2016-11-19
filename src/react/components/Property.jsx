import React, { PropTypes } from 'react';

import PropertyBase from './PropertyBase';

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
      this.context.schemaObject['@type'],
      this.expandedProperty(),
      this.context.topology
    );
  }

  render() {
    const Klass = this.getLinkedObjectClass();
    if (Klass) {
      return <Klass {...this.props} />;
    }
    return (<div>{this.getLinkedObjectProperty()}</div>);
  }
}

Property.contextTypes = {
  linkedRenderStore: PropTypes.object,
  schemaObject: PropTypes.object,
  topology: PropTypes.string,
};

export default Property;
