import { SomeTerm } from "@ontologies/core";
import { getTermBestLang } from "link-lib";
import React from "react";

import { LinkReduxLRSType } from "../../types";
import { PropertyWrappedProps } from "../Property";

export function createLimitTimes<P extends PropertyWrappedProps>(
  props: P,
  objRaw: SomeTerm[],
  lrs: LinkReduxLRSType,
): (func: (prop: SomeTerm) => React.ReactNode,
    associationRenderer: React.ComponentType<P>) => React.ReactElement<P> | null {
  return (
    func: (prop: SomeTerm) => React.ReactNode,
    associationRenderer: React.ComponentType<P>,
  ) => limitTimes(
    props,
    objRaw,
    lrs,
    func,
    associationRenderer,
  );
}

export function limitTimes<P extends PropertyWrappedProps>(
  props: P,
  objRaw: SomeTerm[],
  lrs: LinkReduxLRSType,
  func: (prop: SomeTerm) => React.ReactNode,
  associationRenderer: React.ComponentType<P>,
): React.ReactElement<P> | null {

  const associationProps = associationRenderer !== React.Fragment ? props : null;

  if (objRaw.length === 0) {
    return null;
  } else if (objRaw.length === 1) {
    return React.createElement(associationRenderer, associationProps, func(objRaw[0]));
  } else if (props.limit === 1) {
    return React.createElement(
      associationRenderer,
      associationProps,
      func(getTermBestLang(objRaw, (lrs.store as any).langPrefs) as SomeTerm),
    );
  }
  const pLimit = Math.min(...[props.limit, objRaw.length].filter(Number) as number[]);
  const elems = new Array(pLimit);
  for (let i = 0; i < pLimit; i++) {
    elems.push(func(objRaw[i]));
  }

  return React.createElement(associationRenderer, associationProps, elems);
}
