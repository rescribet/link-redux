import { allRDFValues, anyRDFValue } from 'link-lib';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { Component } from 'react';

import { linkedObjectVersionByIRI } from './linkedObjects/selectors';
import { getLinkedObject, fetchLinkedObject } from './linkedObjects/actions';
import Property from '../react/components/Property';
import { lrsType, subjectType, topologyType } from '../propTypes';

const propTypes = {
  children: PropTypes.node,
  forceRender: PropTypes.bool,
  loadLinkedObject: PropTypes.func.isRequired,
  object: subjectType.isRequired,
  onError: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.func,
  ]),
  onLoad: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.func,
  ]),
  topology: topologyType,
  version: PropTypes.string.isRequired,
};

const defaultProps = {
  children: undefined,
  forceRender: false,
  onError: undefined,
  onLoad: undefined,
  topology: undefined,
};

const nodeTypes = ['NamedNode', 'BlankNode'];

class LinkedObjectContainer extends Component {
  static hasData(data) {
    return typeof data !== 'undefined' && data.length >= 2;
  }

  static hasErrors(data) {
    const statusCode = anyRDFValue(data, 'http://www.w3.org/2011/http#statusCodeValue');
    return statusCode >= 400;
  }

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
    return this.context.linkedRenderStore.tryEntity((
      this.context.linkedRenderStore.expandProperty(this.subject(props))
    ));
  }

  loadLinkedObject(props = this.props) {
    const data = this.data(props);
    if (data === undefined || data.length === 0) {
      this.props.loadLinkedObject(this.subject(props), props.fetch);
    }
  }

  objType(data) {
    const { linkedRenderStore } = this.context;
    return allRDFValues(data, linkedRenderStore.namespaces.rdf('type'), true) || linkedRenderStore.defaultType;
  }

  subject(props = this.props) {
    if (!nodeTypes.includes(props.object.termType)) {
      throw new Error(`[LOC] Object must be a node (was '${typeof props.object}[${props.object}]')`);
    }
    return props.object;
  }

  topology() {
    return this.props.topology === null
      ? undefined
      : (this.props.topology || this.context.topology);
  }

  renderChildren() {
    return React.createElement(
      'div',
      { className: 'view-overridden', style: { display: 'inherit' } },
      this.props.children,
    );
  }

  render() {
    const { linkedRenderStore } = this.context;
    const data = this.data();
    if (this.props.forceRender && this.props.children) {
      return this.renderChildren();
    }
    if (!LinkedObjectContainer.hasData(data)) {
      const LoadComp = this.onLoad();
      return LoadComp === null ? null : React.createElement(LoadComp, this.props);
    }
    if (LinkedObjectContainer.hasErrors(data)) {
      const ErrComp = this.onError();
      if (ErrComp) {
        return React.createElement(
          ErrComp,
          { ...this.props, subject: this.subject() },
        );
      }
      return null;
    }
    if (this.props.children) {
      return this.renderChildren();
    }
    const objType = this.objType(data);
    if (objType === undefined) {
      return null;
    }
    const Klass = linkedRenderStore.getRenderClassForType(
      objType,
      this.topology(),
    );
    if (Klass !== undefined) {
      return React.createElement(Klass, this.props);
    }
    return React.createElement(
      'div',
      { className: 'no-view' },
      React.createElement(
        Property,
        { label: linkedRenderStore.namespaces.schema('name') },
      ),
      React.createElement('p', null, `We currently don't have a view for this (${objType})`),
    );
  }
}

LinkedObjectContainer.childContextTypes = {
  subject: subjectType,
  topology: topologyType,
};
LinkedObjectContainer.contextTypes = {
  linkedRenderStore: lrsType,
  topology: topologyType,
};
LinkedObjectContainer.defaultProps = defaultProps;
LinkedObjectContainer.displayName = 'LinkedObjectContainer';
LinkedObjectContainer.propTypes = propTypes;

export { LinkedObjectContainer };

const mapStateToProps = (state, { object: subject }) => {
  if (!subject) {
    throw new Error('[LOC] an object must be given');
  }
  if (!nodeTypes.includes(subject.termType)) {
    throw new Error(`[LOC] Object must be a node (was '${typeof subject}')`);
  }
  return {
    version: linkedObjectVersionByIRI(state, subject) || 'new',
  };
};

const mapDispatchToProps = dispatch => ({
  loadLinkedObject: (href, fetch) =>
    dispatch(fetch === false ?
      getLinkedObject(href) :
      fetchLinkedObject(href)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LinkedObjectContainer);
