import React from 'react';

import { subjectType } from '../propTypes';

const linkedSubject = (ConnectedProp) => {
  function LinkedSubjectComp(props, { subject }) {
    if (typeof subject === 'undefined') {
      throw new Error('[LS] A subject must be given');
    }
    return React.createElement(
      ConnectedProp,
      { ...props, subject },
    );
  }
  LinkedSubjectComp.contextTypes = {
    subject: subjectType,
  };
  LinkedSubjectComp.displayName = ConnectedProp.displayName === undefined
    ? 'linkedSubject'
    : `linkedSubject[${ConnectedProp.displayName}]`;

  return LinkedSubjectComp;
};

export default linkedSubject;
