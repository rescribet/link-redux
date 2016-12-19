import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import assert from 'assert';

import { selectLinkedObject } from './linkedObjects/selectors';
import { getLinkedObject, fetchLinkedObject } from './linkedObjects/actions';
import Type from './Type';

const propTypes = {
  children: PropTypes.any,
  data: PropTypes.object,
  fetch: PropTypes.bool,
  loadLinkedObject: PropTypes.func.isRequired,
  object: PropTypes.any,
  topology: PropTypes.string,
};

class LinkedObjectContainer extends Component {
  getChildContext() {
    let data = this.props.data && this.props.data.constructor === Map ? this.props.data.toJS() : this.props.data;
    return {
      schemaObject: data,
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
    if (props.data === undefined || typeof props.data.href_url !== 'string') {
      this.props.loadLinkedObject(props.object, props.fetch);
    }
  }

  render() {
    const {
      data,
    } = this.props;
    if (!data || data.loading) {
      return null;
    }
    if (this.props.children) {
      return (
        <div className="view-overridden">
          {this.props.children}
        </div>
      );
    }
    const { object: ignored, ...otherProps } = this.props;
    return (
      <Type {...otherProps} />
    );
  }
}

LinkedObjectContainer.childContextTypes = {
  schemaObject: PropTypes.object,
  topology: PropTypes.string,
};
LinkedObjectContainer.propTypes = propTypes;

export default connect(
  (state, ownProps) => {
    assert(ownProps.object, '[LOC] an object must be given');
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
