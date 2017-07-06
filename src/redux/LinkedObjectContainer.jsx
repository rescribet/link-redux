import LRS, { anyObjectValue, anyRDFValue } from 'link-lib';
import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react';
import rdf from 'rdflib';

import { linkedObjectByIRI, linkedObjectVersionByIRI } from './linkedObjects/selectors';
import { getLinkedObject, fetchLinkedObject } from './linkedObjects/actions';
import Property from '../react/components/Property';

const propTypes = {
  children: PropTypes.any,
  data: PropTypes.object,
  fetch: PropTypes.bool,
  loadLinkedObject: PropTypes.func.isRequired,
  object: PropTypes.any.isRequired,
  onError: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.func,
    PropTypes.undefined,
  ]),
  topology: PropTypes.string,
};

class LinkedObjectContainer extends Component {
  getChildContext() {
    return {
      schemaObject: this.props.data,
      subject: this.context.linkedRenderStore.expandProperty(this.props.object),
      topology: this.props.topology === null ? undefined : this.props.topology || this.context.topology,
    };
  }

  componentWillMount() {
    this.loadLinkedObject();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.object !== nextProps.object) {
      this.loadLinkedObject(nextProps);
    }
  }

  shouldComponentUpdate(nextProps) {
    return !(
      this.props.data &&
      this.props.object === nextProps.object &&
      anyObjectValue(this.props.data, 'http://www.w3.org/2011/http#statusCodeValue') === anyObjectValue(nextProps.data, 'http://www.w3.org/2011/http#statusCodeValue') &&
      anyObjectValue(this.props.data, LRS.namespaces.rdf('type')) === anyObjectValue(nextProps.data, LRS.namespaces.rdf('type'))
    );
  }

  onError() {
    const { linkedRenderStore } = this.context;
    return this.props.onError || (linkedRenderStore && linkedRenderStore.onError);
  }

  onLoad() {
    return this.props.onLoad || null;
  }

  loadLinkedObject(props = this.props) {
    if (props.data === undefined) { // && typeof getP(props.data, 'href_url') !== 'string') {
      this.props.loadLinkedObject(props.object, props.fetch);
    }
  }

  render() {
    const {
      topology,
    } = this.props;
    // data,
    const { object: subject } = this.props;
    const data = this.context.linkedRenderStore.tryEntity(this.context.linkedRenderStore.expandProperty(subject));
    const ErrComp = this.onError();
    const statusCode = anyRDFValue(data, 'http://www.w3.org/2011/http#statusCodeValue');
    if (statusCode >= 400 && ErrComp) { // && Object.keys(otherProps).length <= 1
      return <ErrComp subject={subject} {...this.props} />;
    }
    const LoadComp = this.onLoad();
    if (typeof data === 'undefined' || data.size <= 2) {
      return LoadComp === null ? null : <LoadComp {...this.props} />;
    }
    if (this.props.children) {
      return (
        <div className="view-overridden" style={{ display: 'inherit' }}>
          {this.props.children}
        </div>
      );
      // <Broadcast channel={subject} value={this.props.data}>
      // </Broadcast>
    }

    const objType = anyRDFValue(data, LRS.namespaces.rdf('type')) || LRS.defaultType;
    if (objType === undefined) {
      return null;
    }
    const Klass = this.context.linkedRenderStore.getRenderClassForType(objType, topology);
    if (Klass !== undefined) {
      return (
        <Klass {...this.props} />
      );
      // <Broadcast channel={subject} value={this.props.data}>
      // </Broadcast>
    }
    return (
      <div className="no-view">
        <Property label="schema:name" />
        <p>{"We currently don't have a view for this"}</p>
      </div>
    );
  }
}

LinkedObjectContainer.childContextTypes = {
  schemaObject: PropTypes.object,
  subject: PropTypes.objectOf(rdf.NamedNode),
  topology: PropTypes.string,
};
LinkedObjectContainer.contextTypes = {
  linkedRenderStore: PropTypes.object,
  topology: PropTypes.string,
};
LinkedObjectContainer.displayName = 'LinkedObjectContainer';
LinkedObjectContainer.propTypes = propTypes;

export { LinkedObjectContainer };

export default connect(
  (state, { object: subject }) => {
    if (!subject) {
      throw new Error('[LOC] an object must be given');
    }
    // Smushing done by librdf
    // const normIRI = window.LRS.schema.equivalenceSet.find(
    //   window.LRS.schema.equivalenceSet.add(subject),
    // ).value;
    return {
      data: linkedObjectByIRI(state, `<${new URL(subject).toString()}>`),
      version: linkedObjectVersionByIRI(state, `<${new URL(subject).toString()}>`),
    };
  },
  dispatch => ({
    loadLinkedObject: (href, fetch) =>
      dispatch(fetch === false ?
        getLinkedObject(href) :
        fetchLinkedObject(href)),
  }),
)(LinkedObjectContainer);
