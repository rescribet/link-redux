import React, { PropTypes } from 'react';
import { getValueOrID } from 'link-lib';
import Property from '../react/components/Property';

const propTypes = {
  children: PropTypes.any,
};

const Type = (props, { linkedRenderStore, schemaObject, topology }) => {
  const objType = getValueOrID(schemaObject['@type']);
  if (objType === undefined) {
    return null;
  }
  const Klass = linkedRenderStore.getRenderClassForType(objType, topology);
  if (Klass !== undefined) {
    return (
      <Klass {...props}>
        {props.children}
      </Klass>
    );
  }
  return (
    <div className="no-view">
      <Property label="schema:name" />
      <p>{"We currently don't have a view for this"}</p>
    </div>
  );
};

Type.contextTypes = {
  linkedRenderStore: PropTypes.object,
  schemaObject: PropTypes.object,
  topology: PropTypes.string,
};
Type.propTypes = propTypes;

export default Type;
