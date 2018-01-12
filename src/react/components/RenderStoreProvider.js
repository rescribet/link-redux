import PropTypes from 'prop-types';
import { Component } from 'react';

import { lrsType } from '../../propTypes';

const childContextTypes = {
  linkedRenderStore: lrsType,
};
const propTypes = {
  children: PropTypes.node.isRequired,
  linkedRenderStore: lrsType.isRequired,
};

class RenderStoreProvider extends Component {
  getChildContext() {
    return {
      linkedRenderStore: this.props.linkedRenderStore,
    };
  }

  render() {
    return this.props.children;
  }
}

RenderStoreProvider.childContextTypes = childContextTypes;
RenderStoreProvider.propTypes = propTypes;

export default RenderStoreProvider;
