import "../../../__tests__/useHashFactory";

import rdfFactory from "@ontologies/core";
import ex from "../../../ontology/ex";
import { ReturnType } from "../../../types";

import { dataPropsToPropMap } from "../dataPropsToPropMap";

describe("dataPropsToPropMap", () => {
    it("processes an empty map", () => {
        const [ propMap, requestedProperties ] = dataPropsToPropMap({}, {});

        expect(propMap).toEqual({});
        expect(requestedProperties).toHaveLength(0);
    });

    it("processes a map with an array value", () => {
        const [ propMap, requestedProperties ] = dataPropsToPropMap({
            cLabel: [ex.ns("p"), ex.ns("q")],
        }, {});

        expect(propMap).toHaveProperty("cLabel");
        expect(requestedProperties).toEqual([
            rdfFactory.id(ex.ns("p")),
            rdfFactory.id(ex.ns("q")),
        ]);

        const { cLabel } = propMap;
        expect(cLabel).toHaveProperty("label", [ex.ns("p"), ex.ns("q")]);
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
            cLabel: ex.ns("p"),
        }, {});

        expect(propMap).toHaveProperty("cLabel");
        expect(requestedProperties).toEqual([rdfFactory.id(ex.ns("p"))]);

        const { cLabel } = propMap;
        expect(cLabel).toHaveProperty("label", [ex.ns("p")]);
        expect(cLabel).toHaveProperty("name", "cLabel");
    });

    it("skips others' properties", () => {
        const dataProps = Object.create({ oLabel: ex.ns("o") });
        dataProps.cLabel = ex.ns("p");

        const [ propMap, requestedProperties ] = dataPropsToPropMap(dataProps, {});

        expect(propMap).toHaveProperty("cLabel");
        expect(propMap).not.toHaveProperty("oLabel");
        expect(requestedProperties).toEqual([rdfFactory.id(ex.ns("p"))]);

        const { cLabel } = propMap;
        expect(cLabel).toHaveProperty("label", [ex.ns("p")]);
        expect(cLabel).toHaveProperty("name", "cLabel");
    });

    it("processes a map with object value", () => {
        const [ propMap, requestedProperties ] = dataPropsToPropMap({
            cLabel: {
                label: ex.ns("p"),
            },
        }, {});

        expect(propMap).toHaveProperty("cLabel");
        expect(requestedProperties).toEqual([rdfFactory.id(ex.ns("p"))]);

        const { cLabel } = propMap;
        expect(cLabel).toHaveProperty("label", [ex.ns("p")]);
        expect(cLabel).toHaveProperty("name", "cLabel");
        expect(cLabel).toHaveProperty("returnType", ReturnType.Term);
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

    it("throws when a map with object value has an empty name", () => {
        expect(() => {
            dataPropsToPropMap({
                cLabel: {
                  label: ex.ns("p"),
                  name: " \t\v\r\n ",
                },
            }, {});
        }).toThrowError(TypeError);
    });

    it("allows setting the returnType", () => {
        const [ propMap, requestedProperties ] = dataPropsToPropMap({
            cLabel: {
                label: ex.ns("p"),
                returnType: ReturnType.Statement,
            },
        }, {});

        expect(propMap).toHaveProperty("cLabel");
        expect(requestedProperties).toEqual([rdfFactory.id(ex.ns("p"))]);

        const { cLabel } = propMap;
        expect(cLabel).toHaveProperty("label", [ex.ns("p")]);
        expect(cLabel).toHaveProperty("name", "cLabel");
        expect(cLabel).toHaveProperty("returnType", ReturnType.Statement);
    });
});
