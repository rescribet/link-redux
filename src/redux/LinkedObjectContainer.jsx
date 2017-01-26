import { getP } from 'link-lib';
import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react';

import { selectLinkedObject } from './linkedObjects/selectors';
import { getLinkedObject, fetchLinkedObject } from './linkedObjects/actions';
import Type from './Type';

const propTypes = {
  children: PropTypes.any,
  data: PropTypes.object,
  fetch: PropTypes.bool,
  loadLinkedObject: PropTypes.func.isRequired,
  object: PropTypes.any.isRequired,
  onError: PropTypes.element,
  topology: PropTypes.string,
};

class LinkedObjectContainer extends Component {
  getChildContext() {
    return {
      schemaObject: this.props.data,
      topology: this.props.topology,
    };
  }

  componentWillMount() {
    this.loadLinkedObject();
  }

  componentWillReceiveProps(nextProps) {
    const { data } = nextProps;
    if (typeof data === 'undefined') {
      this.loadLinkedObject(nextProps);
    }
  }

  loadLinkedObject(props = this.props) {
    if (props.data === undefined || typeof getP(props.data, 'href_url') !== 'string') {
      this.props.loadLinkedObject(props.object, props.fetch);
    }
  }

  onError() {
    const { linkedRenderStore } = this.context;
    return this.props.onError || (linkedRenderStore && linkedRenderStore.onError);
  }

  shouldComponentUpdate(nextProps) {
    const { data } = this.props;
    return !(data && getP(data, '@type') === getP(nextProps.data, '@type'));
  }

  render() {
    const {
      data,
    } = this.props;
    if (!data || getP(data, 'loading')) {
      return null;
    }
    const { object: ignored, ...otherProps } = this.props;
    const ErrComp = this.onError();
    const statusCode = getP(data, 'http://www.w3.org/2011/http#statusCodeValue');
    if (statusCode >= 400 && ErrComp && Object.keys(otherProps).length <= 1) {
      return <ErrComp {...otherProps} />;
    }
    if (this.props.children) {
      return (
        <div className="view-overridden" style={{display: 'inherit'}}>
          {this.props.children}
        </div>
      );
    }
    return (
      <Type
        responseCode={statusCode}
        {...otherProps}
      />
    );
  }
}

LinkedObjectContainer.childContextTypes = {
  schemaObject: PropTypes.object,
  topology: PropTypes.string,
};
LinkedObjectContainer.contextTypes = {
  linkedRenderStore: PropTypes.object,
};
LinkedObjectContainer.propTypes = propTypes;

export { LinkedObjectContainer };

export default connect(
  (state, ownProps) => {
    if (!ownProps.object) {
      throw new Error('[LOC] an object must be given');
    }
    return {
      data: selectLinkedObject(state, ownProps),
    };
  },
  dispatch => ({
    loadLinkedObject: (href, fetch) =>
      dispatch(fetch === false ?
        getLinkedObject(href) :
        fetchLinkedObject(href)),
  })
)(LinkedObjectContainer);
