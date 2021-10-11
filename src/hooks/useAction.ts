import { isNamedNode, isTerm, SomeTerm } from "@ontologies/core";
import { ActionMap, DataObject, SomeNode } from "link-lib";
import React from "react";

import { LinkReduxLRSType } from "../types";

import { useLRS } from "./useLRS";
import { useSubject } from "./useSubject";

export type BoundActionHandler = (...args: any[]) => Promise<any>;

const findAction = (lrs: LinkReduxLRSType, actionPath: string) => actionPath
  .split(".")
  .reduce<{ [k: string]: ActionMap } | ActionMap | BoundActionHandler | undefined>(
    (acc, next) => typeof acc === "object" ? acc?.[next] : undefined,
    lrs.actions,
  );

export class NoActionError extends Error {
  constructor(message?: string | undefined) {
    super(message);
    this.name = "NoActionError";
  }
}

const createHandler = (
  lrs: LinkReduxLRSType,
  action: SomeTerm | string | undefined,
  defaultArgs?: DataObject,
) => {
  if (typeof action !== "string" && !isNamedNode(action)) {
    return () => Promise.reject(new NoActionError(action?.toString()));
  }

  if (isNamedNode(action)) {
    return (args?: DataObject) => lrs.exec(action, args ?? defaultArgs);
  }

  const preBoundAction = findAction(lrs, action);
  if (typeof preBoundAction !== "function") {
    throw new Error(`No handler in actions at '${action}'`);
  }

  return (args?: DataObject) => preBoundAction(args);
};

export const extractParams = (
  ctxSubject: SomeNode | undefined,
  args: Array<SomeTerm | string | undefined | DataObject>,
): [SomeTerm | undefined, DataObject | undefined] => {
  const first = args[0];
  if (args.length === 0 || (args.length === 1 && first !== undefined && typeof first !== "string" && !isTerm(first))) {
    return [ctxSubject, args[0] as DataObject | undefined];
  }

  return args as [SomeTerm, DataObject | undefined];
};

/**
 * Returns a handler which executes the context subject or {action} from the current store.
 * If `action` is `undefined` or a {Literal}, it rejects with {NoActionError}.
 *
 * This function uses {exec}, so called handlers will pass through the middleware.
 *
 * @param action Can be the IRI of an action, or a dot separated property path on {lrs.actions}.
 * @param defaultArgs Will be passed if the handler calling site doesn't provide any args.
 */
export function useAction(
  action: SomeTerm | string | undefined,
  defaultArgs?: DataObject,
): (args?: DataObject) => Promise<any>;
export function useAction(defaultArgs?: DataObject): (args?: DataObject) => Promise<any>;
export function useAction(...args: Array<SomeTerm | string | undefined | DataObject>):
  (args?: DataObject) => Promise<any> {
  const lrs = useLRS();
  const [subject, update] = useSubject();
  const [target, defaultArgs] = extractParams(subject, args);
  const [handler, setHandler] = React.useState(() => createHandler(lrs, target, defaultArgs));

  React.useEffect(() => {
    const newHandler = createHandler(lrs, target, defaultArgs);
    setHandler(() => newHandler);
  }, [lrs, target, update, defaultArgs]);

  return handler;
}
