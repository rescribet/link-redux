import "./useHashFactory";

import rdfFactory from "@ontologies/core";
import { mount } from "enzyme";
import {
    DEFAULT_TOPOLOGY,
    defaultNS,
    RENDER_CLASS_NAME,
} from "link-lib";
import React from "react";

import { register } from "../register";
import { FC } from "../types";

describe("register.spec.ts", () => {
    it("registers built-in functions", () => {
        // tslint:disable-next-line:no-console
        const Comp: any = console.log;
        Comp.type = defaultNS.ex("TestClass");
        const [ registration ] = register(Comp);

        expect(registration).toHaveProperty("component", Comp);
        expect(registration).toHaveProperty("property", rdfFactory.id(RENDER_CLASS_NAME));
        expect(registration).toHaveProperty("topology", rdfFactory.id(DEFAULT_TOPOLOGY));
        expect(registration).toHaveProperty("type", rdfFactory.id(defaultNS.ex("TestClass")));
    });

    it("registers a functional component", () => {
        const Comp = () => null;
        Comp.type = defaultNS.ex("TestClass");
        const [ registration ] = register(Comp);

        expect(registration).toHaveProperty("component", Comp);
        expect(registration).toHaveProperty("property", rdfFactory.id(RENDER_CLASS_NAME));
        expect(registration).toHaveProperty("topology", rdfFactory.id(DEFAULT_TOPOLOGY));
        expect(registration).toHaveProperty("type", rdfFactory.id(defaultNS.ex("TestClass")));
    });

    it("registers a class component", () => {
        class Comp extends React.Component {
            public static type = defaultNS.ex("TestClass");

            public render() { return null; }
        }
        const [ registration ] = register(Comp);

        expect(registration).toHaveProperty("component", Comp);
        expect(registration).toHaveProperty("property", rdfFactory.id(RENDER_CLASS_NAME));
        expect(registration).toHaveProperty("topology", rdfFactory.id(DEFAULT_TOPOLOGY));
        expect(registration).toHaveProperty("type", rdfFactory.id(defaultNS.ex("TestClass")));
    });

    it("wraps passed hocs", () => {
        let hoc2Inner;
        const hoc1 = <P>(comp: React.ComponentType<P & { prop1: string }>): React.ComponentType<P> => (props: P) =>
            React.createElement(comp,  { ...props, prop1: "hoc1" }, null);

        const hoc2 = <P>(comp: React.ComponentType<P & { prop2: string }>): React.ComponentType<P> => {
            hoc2Inner = (props: P) => React.createElement(comp,  { ...props, prop2: "hoc2" }, null);

            return hoc2Inner;
        };

        const Comp: FC<{ prop1: string, prop2: string }> = ({ prop1, prop2 }) =>
            React.createElement("p", null, `value.${prop1}.${prop2}`);
        Comp.type = defaultNS.ex("TestClass");
        Comp.hocs = [hoc1, hoc2];

        const [ registration ] = register(Comp);

        expect(registration).toHaveProperty("component", hoc2Inner);
        const elem = mount(React.createElement(registration.component, null, null));
        expect(elem.find(registration.component)).toHaveText("value.hoc1.hoc2");
    });
});
