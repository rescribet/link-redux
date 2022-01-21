import { SomeTerm } from "@ontologies/core";
import { getTermBestLang } from "link-lib";
import React from "react";

import { LinkReduxLRSType } from "../../types";
import { PropertyWrappedProps } from "../Property";

export function createPropertyRenderer<P extends PropertyWrappedProps>(
  props: P,
  objRaw: SomeTerm[],
  lrs: LinkReduxLRSType,
): (func: (prop: SomeTerm) => React.ReactNode,
    associationRenderer: React.ComponentType<P>) => React.ReactElement<P> | null {
  return (
    func: (prop: SomeTerm) => React.ReactNode,
    associationRenderer: React.ComponentType<P>,
  ) => {
    const associationProps = associationRenderer !== React.Fragment ? props : null;

    if (objRaw.length === 0) {
      return null;
    } else if (objRaw.length === 1) {
      return React.createElement(associationRenderer, associationProps, func(objRaw[0]));
    }

    return React.createElement(
      associationRenderer,
      associationProps,
      func(getTermBestLang(objRaw, (lrs.store as any).langPrefs) as SomeTerm),
    );
  };
}
