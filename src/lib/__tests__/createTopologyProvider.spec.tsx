import * as schema from "@ontologies/schema";
import { render } from "@testing-library/react";
import { LinkedRenderStore, RENDER_CLASS_NAME } from "link-lib";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { Resource } from "../../components/Resource";
import example from "../../ontology/example";
import { createTopologyProvider } from "../createTopologyProvider";

const createTestElement = (testId = "testComponent") => () => React.createElement(
  "span",
  { "data-testid": testId },
);

const id = "resources/5";
const iri = example.ns(id);

describe("createTopologyProvider hook", () => {
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

    const Provider = createTopologyProvider(example.ns("collection"));

    const CollectionProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
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

  it("set's displayName for Topology providers", () => {
    const CollectionProvider = createTopologyProvider(example.ns("collection"));
    expect(CollectionProvider.displayName).toEqual("TP(Collection)");

    const ApexProvider = createTopologyProvider(example.ns(""));
    expect(ApexProvider.displayName).toEqual("TP(Http://example.com/)");
  });
});
