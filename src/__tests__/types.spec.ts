import schema from "@ontologies/schema";

import {
  LinkOpts,
  OutputTypeFromOpts,
  OutputTypeFromReturnType,
  ReturnType,
} from "../types";

describe("types", () => {
  const ignore = (arg: any): void => arg;

  describe("OutputTypeFromReturnType", () => {

    function toOutputType<T extends ReturnType>(obj: T): OutputTypeFromReturnType<T, never> {
      return obj as unknown as OutputTypeFromReturnType<typeof obj>;
    }

    const term = toOutputType(ReturnType.Term);
    ignore(term?.value);
    // @ts-expect-error
    ignore(term?.[0]);
    // @ts-expect-error
    ignore(term.whatever());

    const value = toOutputType(ReturnType.Value);
    ignore(value?.fixed());
    ignore(value?.[0]);
    // @ts-expect-error
    ignore(value?.whatever());
    // @ts-expect-error
    ignore(value?.value);

    const quad = toOutputType(ReturnType.Statement);
    ignore(quad?.subject);
    // @ts-expect-error
    ignore(quad?.[0]);
    // @ts-expect-error
    ignore(quad?.whatever());
    // @ts-expect-error
    ignore(quad?.value);

    const termArr = toOutputType(ReturnType.AllTerms);
    ignore(termArr[0].value);
    ignore(termArr[0]);
    // @ts-expect-error
    ignore(termArr[0].whatever());
    // @ts-expect-error
    ignore(termArr.whatever());

    const valueArr = toOutputType(ReturnType.AllValues);
    ignore(valueArr[0].fixed());
    ignore(valueArr[0]);
    // @ts-expect-error
    ignore(valueArr[0].whatever());
    // @ts-expect-error
    ignore(valueArr[0].value);
    // @ts-expect-error
    ignore(valueArr.whatever());

    const quadArr = toOutputType(ReturnType.AllStatements);
    ignore(quadArr[0].subject);
    ignore(quadArr[0]);
    // @ts-expect-error
    ignore(quadArr[0].whatever());
    // @ts-expect-error
    ignore(quadArr[0].value);
    // @ts-expect-error
    ignore(quadArr.whatever());
  });

  describe("OutputTypeFromOpts", () => {
    function test<T extends LinkOpts>(obj: T): OutputTypeFromOpts<T, never> {
      return obj as unknown as OutputTypeFromOpts<T>;
    }

    const term = test({
      label: schema.name,
      returnType: ReturnType.Term,
    });

    ignore(term.value);
    // @ts-expect-error
    ignore(term[0]);
    // @ts-expect-error
    ignore(term.subject);
  });
});
