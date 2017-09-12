import { allRDFValues, anyRDFValue } from 'link-lib';
import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react';
import rdf from 'rdflib';

import { linkedObjectVersionByIRI } from './linkedObjects/selectors';
import { getLinkedObject, fetchLinkedObject } from './linkedObjects/actions';
import Property from '../react/components/Property';

const propTypes = {
  children: PropTypes.any,
  fetch: PropTypes.bool,
  loadLinkedObject: PropTypes.func.isRequired,
  object: PropTypes.any.isRequired,
  onError: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.func,
  ]),
  topology: PropTypes.oneOfType([
    PropTypes.instanceOf(rdf.NamedNode),
    PropTypes.string,
  ]),
  version: PropTypes.string,
};

class LinkedObjectContainer extends Component {
  getChildContext() {
    const p = this.context.linkedRenderStore.expandProperty(this.subject());
    return {
      subject: p,
      topology: this.topology(),
    };
  }

  componentWillMount() {
    this.loadLinkedObject();
  }

  componentWillReceiveProps(nextProps) {
    if (this.subject() !== this.subject(nextProps)) {
      this.loadLinkedObject(nextProps);
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.props.version !== nextProps.version ||
      this.props.object !== nextProps.object;
  }

  onError() {
    const { linkedRenderStore } = this.context;
    return this.props.onError || (linkedRenderStore && linkedRenderStore.onError);
  }

  onLoad() {
    return this.props.onLoad || this.context.linkedRenderStore.loadingComp || null;
  }

  data(props = this.props) {
    return this.context.linkedRenderStore.tryEntity(
      this.context.linkedRenderStore.expandProperty(this.subject(props)),
    );
  }

  loadLinkedObject(props = this.props) {
    const data = this.data(props);
    if (data === undefined || data.length === 0) {
      this.props.loadLinkedObject(this.subject(props), props.fetch);
    }
  }

  subject(props = this.props) {
    if (props.object.constructor === rdf.NamedNode || props.object.termType === 'NamedNode') {
      return props.object;
    }
    return new rdf.NamedNode(props.object);
  }

  topology() {
    return this.props.topology === null
      ? undefined
      : (this.props.topology || this.context.topology);
  }

  render() {
    const { linkedRenderStore } = this.context;
    const data = this.data();
    const ErrComp = this.onError();
    const statusCode = anyRDFValue(data, 'http://www.w3.org/2011/http#statusCodeValue');
    if (statusCode >= 400 && ErrComp) { // && Object.keys(otherProps).length <= 1
      return <ErrComp subject={this.subject()} {...this.props} />;
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
    }
    const objType = allRDFValues(data, linkedRenderStore.namespaces.rdf('type'), true) || linkedRenderStore.defaultType;
    if (objType === undefined) {
      return null;
    }
    const Klass = linkedRenderStore.getRenderClassForType(
      objType,
      this.topology()
    );
    if (Klass !== undefined) {
      return (
        <Klass {...this.props} />
      );
    }
    return (
      <div className="no-view">
        <Property label={linkedRenderStore.namespaces.schema('name')} />
        <p>{"We currently don't have a view for this"}</p>
      </div>
    );
  }
}

LinkedObjectContainer.childContextTypes = {
  subject: PropTypes.instanceOf(rdf.NamedNode),
  topology: PropTypes.oneOfType([
    PropTypes.instanceOf(rdf.NamedNode),
    PropTypes.string,
  ]),
};
LinkedObjectContainer.contextTypes = {
  linkedRenderStore: PropTypes.object,
  topology: PropTypes.oneOfType([
    PropTypes.instanceOf(rdf.NamedNode),
    PropTypes.string,
  ]),
};
LinkedObjectContainer.displayName = 'LinkedObjectContainer';
LinkedObjectContainer.propTypes = propTypes;

export { LinkedObjectContainer };

export default connect(
  (state, { object: subject }) => {
    if (!subject) {
      throw new Error('[LOC] an object must be given');
    }
    let s;
    if (subject.constructor === rdf.Statement) {
      throw new Error('[LOC] Object must be a named node');
    } else if (subject.constructor === rdf.NamedNode || subject.termType === 'NamedNode') {
      s = subject;
    } else {
      s = new rdf.NamedNode(subject);
    }
    return {
      version: linkedObjectVersionByIRI(state, s),
    };
  },
  dispatch => ({
    loadLinkedObject: (href, fetch) =>
      dispatch(fetch === false ?
        getLinkedObject(href) :
        fetchLinkedObject(href)),
  }),
)(LinkedObjectContainer);
