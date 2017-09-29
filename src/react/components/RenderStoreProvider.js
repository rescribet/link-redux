import { Component, PropTypes } from 'react';

import { lrsType } from '../../propTypes';

const childContextTypes = {
  linkedRenderStore: lrsType,
};
const propTypes = {
  children: PropTypes.any,
  linkedRenderStore: lrsType,
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
