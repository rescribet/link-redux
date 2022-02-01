import "./useHashFactory";

import { render } from "@testing-library/react";
import {
    DEFAULT_TOPOLOGY,
    RENDER_CLASS_NAME,
} from "link-lib";
import React from "react";

import { Component } from "../components/Component";
import ex from "../ontology/ex";
import { register, registerExotic } from "../register";
import { FC } from "../types";

describe("register.spec.ts", () => {
    it("registers built-in functions", () => {
        // tslint:disable-next-line:no-console
        const Comp: any = console.log;
        Comp.type = ex.ns("TestClass");
        const [ registration ] = register(Comp);

        expect(registration).toHaveProperty("component");
        expect(registration).toHaveProperty("property", RENDER_CLASS_NAME.value);
        expect(registration).toHaveProperty("topology", DEFAULT_TOPOLOGY.value);
        expect(registration).toHaveProperty("type", ex.ns("TestClass").value);
    });

    it("registers a functional component", () => {
        const Comp = () => null;
        Comp.type = ex.ns("TestClass");
        const [ registration ] = register(Comp);

        expect(registration).toHaveProperty("component");
        expect(registration).toHaveProperty("property", RENDER_CLASS_NAME.value);
        expect(registration).toHaveProperty("topology", DEFAULT_TOPOLOGY.value);
        expect(registration).toHaveProperty("type", ex.ns("TestClass").value);
    });

    it("registers a class component", () => {
        class Comp extends Component {
            public static type = ex.ns("TestClass");

            public render() { return null; }
        }
        const [ registration ] = register(Comp);

        expect(registration).toHaveProperty("component");
        expect(registration).toHaveProperty("property", RENDER_CLASS_NAME.value);
        expect(registration).toHaveProperty("topology", DEFAULT_TOPOLOGY.value);
        expect(registration).toHaveProperty("type", ex.ns("TestClass").value);
    });

    it("registers an exotic component", () => {
        const Comp = React.forwardRef((_, __) => {
          return null;
        });

        const [ registration ] = registerExotic(Comp, ex.ns("TestClass"));

        expect(registration).toHaveProperty("component");
        expect(registration).toHaveProperty("property", RENDER_CLASS_NAME.value);
        expect(registration).toHaveProperty("topology", DEFAULT_TOPOLOGY.value);
        expect(registration).toHaveProperty("type", ex.ns("TestClass").value);
    });

    it("wraps passed hocs", () => {
        let hoc2Inner;
        const hoc1 = <P>(comp: React.ComponentType<P & { prop1: string }>): React.ComponentType<P> => (props: P) =>
            React.createElement(comp,  { ...props, prop1: "hoc1" }, null);

        const hoc2 = <P>(comp: React.ComponentType<P & { prop2: string }>): React.ComponentType<P> => {
            hoc2Inner = (props: P) => React.createElement(comp,  { ...props, prop2: "hoc2" }, null);

            return hoc2Inner;
        };

        const Comp: FC<{ prop1: string, prop2: string }> = (props) =>
            React.createElement("p", { "data-testid": "id" }, `value.${props.prop1}.${props.prop2}`);
        Comp.type = ex.ns("TestClass");
        Comp.hocs = [hoc1, hoc2];

        const [ registration ] = register(Comp);

        const { getByTestId } = render(React.createElement(registration.component, null, null));

        expect(getByTestId("id")).toHaveTextContent("value.hoc1.hoc2");
    });
});
