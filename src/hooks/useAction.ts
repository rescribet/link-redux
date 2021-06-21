import { isNamedNode, NamedNode } from "@ontologies/core";
import { ActionMap, DataObject } from "link-lib/dist-types/types";
import React from "react";
import { LinkReduxLRSType } from "../types";
import { useLRS } from "./useLRS";

export type BoundActionHandler = (...args: any[]) => Promise<any>;

const findAction = (lrs: LinkReduxLRSType, actionPath: string) => actionPath
  .split(".")
  .reduce<{ [k: string]: ActionMap } | ActionMap | BoundActionHandler | undefined>(
    (acc, next) => typeof acc === "object" ? acc?.[next] : undefined,
    lrs.actions,
  );

const createHandler = (
  lrs: LinkReduxLRSType,
  action: NamedNode | string,
  defaultArgs?: DataObject,
) => {
  if (isNamedNode(action)) {
    return (args?: DataObject) => lrs.exec(action, args ?? defaultArgs);
  }

  const preBoundAction = findAction(lrs, action);
  if (typeof preBoundAction !== "function") {
    throw new Error(`No handler in actions at '${action}'`);
  }

  return (args?: DataObject) => preBoundAction(args);
};

/**
 * Returns a handler which executes the {action} from the current store.
 *
 * This function uses {exec}, so called handlers will pass through the middleware.
 *
 * @param action Can be the IRI of an action, or a dot separated property path on {lrs.actions}.
 * @param defaultArgs Will be passed if the handler calling site doesn't provide any args.
 */
export const useAction = (
  action: NamedNode | string,
  defaultArgs?: DataObject,
): (args?: DataObject) => Promise<any> => {
  const lrs = useLRS();
  const [handler, setHandler] = React.useState(() => createHandler(lrs, action, defaultArgs));

  React.useEffect(() => {
    const newHandler = createHandler(lrs, action, defaultArgs);
    setHandler(() => newHandler);
  }, [lrs, action, defaultArgs]);

  return handler;
};
