import React from "react";

import {
  LinkedPropType,
  LinkOpts,
  MapDataToPropsParam,
  SubjectProp,
} from "../types";

import { dataPropsToPropMap } from "./link/dataPropsToPropMap";
import { globalLinkOptsDefaults } from "./link/globalLinkOptsDefaults";
import { wrapWithConnect } from "./link/wrapWithConnect";
import { wrapWithSubject } from "./link/wrapWithSubject";

/**
 * Binds a react component to data properties.
 *
 * The current implementation only supports a one-dimensional array of NamedNode objects. And binds
 * the underlying values to the `props` object with each predicate term as the key.
 *
 * @example
 * ```
 *
 *   const BlogPost = (props) => (
 *     <div>
 *         <h1>{props.name.value}</h1>
 *         <p>{props.text.value}</p>
 *         <Resource subject={props.author} />
 *     </div
 *   )
 *
 *   link([NS.schema("name"), NS.schema("text"), NS.schema("author")])(BlogPost)
 * ```
 * @param {NamedNode[]} mapDataToProps The properties to bind to the component, only NamedNode[] is currently supported.
 * @param {LinkOpts} opts Adjust the default behaviour, these are not yet guaranteed.
 */
export function link(
  mapDataToProps: MapDataToPropsParam = {},
  opts: LinkOpts = globalLinkOptsDefaults,
): <P>(p: React.ComponentType<P & Partial<SubjectProp>>) =>
    React.ComponentType<P & { [k in keyof MapDataToPropsParam]: LinkedPropType }> {

    const [ propMap, requestedProperties ] = dataPropsToPropMap(mapDataToProps, opts);

    if (requestedProperties.length === 0) {
      if (opts !== globalLinkOptsDefaults) {
        throw new TypeError("Bind at least one prop to use render opts");
      }

      return wrapWithSubject;
    }

    return wrapWithConnect(propMap, requestedProperties, opts);
}

export { globalLinkOptsDefaults } from "./link/globalLinkOptsDefaults";
