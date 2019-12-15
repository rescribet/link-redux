import "../../../__tests__/useHashFactory";

import rdfFactory from "@ontologies/core";
import { defaultNS } from "link-lib";

import { dataPropsToPropMap } from "../dataPropsToPropMap";

describe("dataPropsToPropMap", () => {
    it("processes an empty map", () => {
        const [ propMap, requestedProperties ] = dataPropsToPropMap({}, {});

        expect(propMap).toEqual({});
        expect(requestedProperties).toHaveLength(0);
    });

    it("processes a map with an array value", () => {
        const [ propMap, requestedProperties ] = dataPropsToPropMap({
            cLabel: [defaultNS.ex("p"), defaultNS.ex("q")],
        }, {});

        expect(propMap).toHaveProperty("cLabel");
        expect(requestedProperties).toEqual([
            rdfFactory.id(defaultNS.ex("p")),
            rdfFactory.id(defaultNS.ex("q")),
        ]);

        const { cLabel } = propMap;
        expect(cLabel).toHaveProperty("label", [defaultNS.ex("p"), defaultNS.ex("q")]);
        expect(cLabel).toHaveProperty("name", "cLabel");
    });

    it("throws when a map with an array value has no members", () => {
        expect(() => {
            dataPropsToPropMap({
                cLabel: [],
            }, {});
        }).toThrowError(TypeError);
    });

    it("processes a map with a NamedNode value", () => {
        const [ propMap, requestedProperties ] = dataPropsToPropMap({
            cLabel: defaultNS.ex("p"),
        }, {});

        expect(propMap).toHaveProperty("cLabel");
        expect(requestedProperties).toEqual([rdfFactory.id(defaultNS.ex("p"))]);

        const { cLabel } = propMap;
        expect(cLabel).toHaveProperty("label", [defaultNS.ex("p")]);
        expect(cLabel).toHaveProperty("name", "cLabel");
    });

    it("skips others' properties", () => {
        const dataProps = Object.create({ oLabel: defaultNS.ex("o") });
        dataProps.cLabel = defaultNS.ex("p");

        const [ propMap, requestedProperties ] = dataPropsToPropMap(dataProps, {});

        expect(propMap).toHaveProperty("cLabel");
        expect(propMap).not.toHaveProperty("oLabel");
        expect(requestedProperties).toEqual([rdfFactory.id(defaultNS.ex("p"))]);

        const { cLabel } = propMap;
        expect(cLabel).toHaveProperty("label", [defaultNS.ex("p")]);
        expect(cLabel).toHaveProperty("name", "cLabel");
    });

    it("processes a map with object value", () => {
        const [ propMap, requestedProperties ] = dataPropsToPropMap({
            cLabel: {
                label: defaultNS.ex("p"),
            },
        }, {});

        expect(propMap).toHaveProperty("cLabel");
        expect(requestedProperties).toEqual([rdfFactory.id(defaultNS.ex("p"))]);

        const { cLabel } = propMap;
        expect(cLabel).toHaveProperty("label", [defaultNS.ex("p")]);
        expect(cLabel).toHaveProperty("name", "cLabel");
    });

    it("throws when a map with object value has no label", () => {
        expect(() => {
            dataPropsToPropMap({
                cLabel: {
                    label: undefined,
                },
            }, {});
        }).toThrowError(TypeError);
    });
});
