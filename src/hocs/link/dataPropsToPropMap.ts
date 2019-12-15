import rdfFactory, { isNamedNode, NamedNode } from "@ontologies/core";
import { normalizeType } from "link-lib";

import { LinkOpts, MapDataToPropsParam, PropParam } from "../../types";
import { ProcessedLinkOpts } from "../link";

import { globalLinkOptsDefaults } from "./globalLinkOptsDefaults";

export interface DataToPropsMapping {
    [k: string]: ProcessedLinkOpts;
}

type PropMapTuple = [number[], string, ProcessedLinkOpts];

function term(iri: NamedNode): string {
    return (iri as any).term || iri.value.split(/[\/#]/).pop()!.split("?").shift() || "";
}

function mapMultiLabelMap(propKey: string, predObj: NamedNode[], opts: LinkOpts): PropMapTuple {
    if (predObj.length === 0) {
        throw new TypeError("Props array must contain at least one predicate");
    }

    return [
        predObj.map((p) => rdfFactory.id(p)),
        propKey || term(predObj[0]),
        {
            forceRender: opts.forceRender || globalLinkOptsDefaults.forceRender,
            label: predObj,
            limit: opts.limit || globalLinkOptsDefaults.limit,
            name: propKey || term(predObj[0]),
            returnType: opts.returnType || globalLinkOptsDefaults.returnType,
        },
    ];
}

function mapLabelMap(propKey: string, predObj: NamedNode, opts: LinkOpts): PropMapTuple {
    return [
        [rdfFactory.id(predObj)],
        propKey || term(predObj),
        {
            forceRender: opts.forceRender || globalLinkOptsDefaults.forceRender,
            label: [predObj],
            limit: opts.limit || globalLinkOptsDefaults.limit,
            name: propKey || term(predObj),
        },
    ];
}

function mapLinkOptsMap(propKey: string, predObj: LinkOpts, opts: LinkOpts): PropMapTuple {
    const labels = normalizeType(predObj.label).filter(Boolean) as NamedNode[];

    if (predObj.label === undefined) {
        throw new TypeError(`Prop with key '${propKey}' contains no valid labels`);
    }

    return [
        labels.map((label) => rdfFactory.id(label)),
        propKey || predObj.name || term(labels[0]),
        {
            forceRender: predObj.forceRender || opts.forceRender || globalLinkOptsDefaults.forceRender,
            label: normalizeType(predObj.label),
            limit: predObj.limit || opts.limit || globalLinkOptsDefaults.limit,
            linkedProp: predObj.linkedProp || opts.linkedProp || globalLinkOptsDefaults.linkedProp,
            name: propKey || predObj.name || term(labels[0]),
            returnType: predObj.returnType || opts.returnType || globalLinkOptsDefaults.returnType,
        },
    ];
}

function dataPropToPropMap(propKey: string, predObj: PropParam, opts: LinkOpts): PropMapTuple {
    if (Array.isArray(predObj)) {
        return mapMultiLabelMap(propKey, predObj, opts);
    } else if (isNamedNode(predObj)) {
        return mapLabelMap(propKey, predObj, opts);
    }

    return mapLinkOptsMap(propKey, predObj, opts);
}

export function dataPropsToPropMap(mapDataToProps: MapDataToPropsParam,
                                   opts: LinkOpts): [DataToPropsMapping, number[]] {

    const propMap: DataToPropsMapping = {};
    let requestedProperties: number[] = Array.isArray(mapDataToProps)
        ? mapDataToProps.map((p) => rdfFactory.id(p))
        : [];

    for (const propKey in mapDataToProps) {
        if (!mapDataToProps.hasOwnProperty(propKey)) {
            continue;
        }
        const predObj = mapDataToProps[propKey];
        const [ properties, label, mapping ] = dataPropToPropMap(propKey, predObj, opts);
        requestedProperties = requestedProperties.concat(...properties);
        propMap[label] = mapping;
    }

    return [ propMap, requestedProperties ];
}
