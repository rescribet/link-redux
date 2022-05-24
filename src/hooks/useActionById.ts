import { BlankNode, isNamedNode, Literal, NamedNode, SomeTerm } from "@ontologies/core";
import { DataObject } from "link-lib";
import React from "react";

import { useDataInvalidation } from "./useDataInvalidation";
import { useLRS } from "./useLRS";

export type BoundActionHandler = (...args: any[]) => Promise<any>;

/**
 * Returns a handler which executes the {action} from the current store.
 * If `action` is `undefined` or a {Literal}, it returns undefined.
 *
 * This function uses {exec}, so called handlers will pass through the middleware.
 *
 * @param action Can be the IRI of an action, or a dot separated property path on {lrs.actions}.
 * @param defaultArgs Will be passed if the handler calling site doesn't provide any args.
 */
export function useActionById(action: undefined | BlankNode | Literal, defaultArgs?: DataObject): undefined;
export function useActionById(
  action: NamedNode,
  defaultArgs?: DataObject,
): (args?: DataObject) => Promise<any>;
export function useActionById(
  action: SomeTerm | undefined,
  defaultArgs?: DataObject,
): undefined | ((args?: DataObject) => Promise<any>);
export function useActionById(
  action: SomeTerm | undefined,
  defaultArgs?: DataObject,
): undefined | ((args?: DataObject) => Promise<any>) {
  const lrs = useLRS();
  const update = useDataInvalidation(isNamedNode(action) ? action : undefined);

  const callback = React.useCallback((args?: DataObject) => {
    if (isNamedNode(action)) {
      return lrs.exec(action, args ?? defaultArgs);
    }

    throw new Error(`No valid action given: ${action}`);
  }, [lrs, action, update, defaultArgs]);

  return isNamedNode(action) ? callback : undefined;
}
