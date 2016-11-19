import React, { Component, PropTypes } from 'react';

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

RenderStoreProvider.childContextTypes = {
  linkedRenderStore: PropTypes.object,
};

export default RenderStoreProvider;
