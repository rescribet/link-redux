import * as schema from "@ontologies/schema";
import { render } from "@testing-library/react";
import { LinkedRenderStore, RENDER_CLASS_NAME } from "link-lib";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { Resource } from "../../components/Resource";
import example from "../../ontology/example";
import { useTopologyProvider } from "../useTopologyProvider";

const createTestElement = (testId = "testComponent") => () => React.createElement(
  "span",
  { "data-testid": testId },
);

const id = "resources/5";
const iri = example.ns(id);

describe("useTopologyProvider hook", () => {
  it("sets the topology", () => {
    const opts = ctx.multipleCWArr([{ id: iri }, { id: example.ns("resources/10") }]);
    opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
      createTestElement("normalRendered"),
      schema.CreativeWork,
    ));
    opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
      createTestElement("collectionRendered"),
      schema.CreativeWork,
      RENDER_CLASS_NAME,
      example.ns("collection"),
    ));

    const CollectionProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
      const [Provider] = useTopologyProvider(example.ns("collection"));

      return (
        <Provider>
          {children}
        </Provider>
      );
    };

    const comp = (
      <CollectionProvider>
        <Resource subject={example.ns("resources/10")} />
      </CollectionProvider>
    );

    const { getByTestId } = render(opts.wrapComponent(comp));

    expect(getByTestId("collectionRendered")).toBeVisible();
  });
});
