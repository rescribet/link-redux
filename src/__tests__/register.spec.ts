import "./useHashFactory";

import rdfFactory from "@ontologies/core";
import {
    DEFAULT_TOPOLOGY,
    defaultNS,
    RENDER_CLASS_NAME,
} from "link-lib";
import { Component } from "react";

import { register } from "../register";

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
        class Comp extends Component {
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
        const Comp = () => "value";
        Comp.type = defaultNS.ex("TestClass");

        let hoc2Inner;

        const hoc1 = (comp) => () => comp() + ".hoc1";
        const hoc2 = (comp) => {
            hoc2Inner = () => comp() + ".hoc2";

            return hoc2Inner;
        };

        const [ registration ] = register(Comp, hoc1, hoc2);

        expect(registration).toHaveProperty("component", hoc2Inner);
        expect(registration.component()).toEqual("value.hoc1.hoc2");
    });
});
