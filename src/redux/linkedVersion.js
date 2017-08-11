import { connect } from 'react-redux';

import { linkedObjectVersionByIRI } from './linkedObjects/selectors';

export default Component => connect(
  (state, { subject }) => {
    if (typeof subject === 'undefined') {
      throw new Error('[LS] A subject must be given');
    }
    return {
      version: linkedObjectVersionByIRI(state, subject),
    };
  },
)(Component);
