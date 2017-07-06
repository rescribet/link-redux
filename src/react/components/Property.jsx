import React, { PropTypes } from 'react';
import { defaultNS, anyObjectValue } from 'link-lib';

import { expandedProperty, getLinkedObjectProperty } from './PropertyBase';
import LOC from '../../redux/LinkedObjectContainer';

const nodeShape = PropTypes.shape({
  termType: PropTypes.string,
  value: PropTypes.string,
});
export const propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
    nodeShape,
    PropTypes.arrayOf(nodeShape),
  ]).isRequired,
  forceRender: PropTypes.bool,
};
const defaultProps = {
  forceRender: false,
};

function getLinkedObjectClass(props, { topology, subject, linkedRenderStore }) {
  return linkedRenderStore.getRenderClassForProperty(
    anyObjectValue(linkedRenderStore.tryEntity(subject), defaultNS.rdf('type')),
    expandedProperty(props.label, linkedRenderStore),
    topology
  );
}

// class Property extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       objRaw: undefined,
//     };
//   }
//
//   componentDidMount() {
//     if (typeof this.context.subject === 'undefined' || this.context.subject === null) {
//       throw new Error('Invariant violation: subject must be given');
//     }
//     this.context.linkedRenderStore.subscribe(
//       this.context.subject,
//       data => {
//         debugger;
//         this.setState({
//           objRaw: getLinkedObjectProperty(this.props.label, data, undefined, true),
//         });
//       },
//     );
//   }
//
//   render() {
//     const { forceRender } = this.props;
//     // const objRaw = getLinkedObjectProperty(props.label, props, context, true);
//     const obj = this.state.objRaw && this.state.objRaw.value;
//     if (obj === undefined && !forceRender) {
//       return null;
//     }
//     const Klass = getLinkedObjectClass(this.props, this.context);
//     if (Klass) {
//       return <Klass linkedProp={obj} {...this.props} />;
//     }
//     if (typeof objRaw !== 'undefined' && this.state.objRaw.termType === 'NamedNode') {
//       return <LOC object={this.state.objRaw.value} />;
//     }
//     if (obj) {
//       return (<div>{obj}</div>);
//     }
//     debugger;
//     return null;
//   }
// }

const Property = (props, context) => {
  const { forceRender } = props;
  const objRaw = getLinkedObjectProperty(props.label, props, context, true);
  const obj = objRaw && objRaw.value;
  if (obj === undefined && !forceRender) {
    // debugger;
    return null;
  }
  const Klass = getLinkedObjectClass(props, context);
  if (Klass) {
    return <Klass linkedProp={obj} {...props} />;
  }
  if (typeof objRaw !== 'undefined' && objRaw.termType === 'NamedNode') {
    return <LOC object={objRaw.value} />;
  }
  if (obj) {
    return (<div>{obj}</div>);
  }
  debugger;
  return null;
};

//
// /**
//  * Picks the best view for the given objects' property
//  *
//  * @param {Object} object The resource of which the property is rendered
//  *
//  * @param {String} property The property to be rendered
//  */
// class Property extends PropertyBase {
//   getLinkedObjectClass() {
//     return this.context.linkedRenderStore.getRenderClassForProperty(
//       anyObjectValue(this.context.schemaObject, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
//       this.expandedProperty(),
//       this.context.topology
//     );
//   }
//
//   shouldComponentUpdate(nextProps, Ignore, nextContext) {
//     return nextProps.label && (
//       this.props.label !== nextProps.label ||
//       this.props.linkedProp !== nextProps.linkedProp ||
//       anyObjectValue(this.context.schemaObject, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') !== anyObjectValue(nextContext.schemaObject, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') ||
//       anyObjectValue(this.context.schemaObject, nextProps.label) !== anyObjectValue(nextContext.schemaObject, nextProps.label)
//     );
//   }
//
//   render() {
//     const { forceRender } = this.props;
//     const objRaw = this.getLinkedObjectProperty(undefined, undefined, true);
//     const obj = objRaw && objRaw.value;
//     if (obj === undefined && !forceRender) {
//       return null;
//     }
//     const Klass = this.getLinkedObjectClass();
//     if (Klass) {
//       return <Klass linkedProp={obj} {...this.props} />;
//     }
//     if (typeof objRaw !== 'undefined' && objRaw.termType === 'NamedNode') {
//       return <LOC object={objRaw.value} />;
//     }
//     if (obj) {
//       return (<div>{obj}</div>);
//     }
//     return null;
//   }
// }

Property.contextTypes = {
  linkedRenderStore: PropTypes.object,
  subject: PropTypes.object,
  topology: PropTypes.string,
};
Property.displayName = 'Property';
Property.propTypes = propTypes;
Property.defaultProps = defaultProps;

export default Property;
