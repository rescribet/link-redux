import React, { PropTypes } from 'react';
import { NamedNode } from 'rdflib';

const linkedSubject = (ConnectedProp) => {
  function LinkedSubjectComp(props, { subject }) {
    if (typeof subject === 'undefined') {
      throw new Error('[LS] A subject must be given');
    }
    return React.createElement(
      ConnectedProp,
      { subject, ...props }
    );
  }
  LinkedSubjectComp.contextTypes = {
    subject: PropTypes.instanceOf(NamedNode),
  };
  LinkedSubjectComp.displayName = ConnectedProp.displayName === undefined
    ? 'linkedSubject'
    : `linkedSubject[${ConnectedProp.displayName}]`;

  return LinkedSubjectComp;
};

export default linkedSubject;
