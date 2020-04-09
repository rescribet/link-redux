import { isNamedNode, NamedNode } from "@ontologies/core";
import { id, normalizeType } from "link-lib";

import { LinkOpts, MapDataToPropsParam, PropParam } from "../../types";
import { ProcessedLinkOpts } from "../link";

import { globalLinkOptsDefaults } from "./globalLinkOptsDefaults";

export interface DataToPropsMapping extends MapDataToPropsParam {
    [k: string]: ProcessedLinkOpts;
}

type PropMapTuple = [number[], ProcessedLinkOpts];

function mapMultiLabelMap(propKey: string, predObj: NamedNode[], opts: LinkOpts): PropMapTuple {
    if (predObj.length === 0) {
        throw new TypeError("Props array must contain at least one predicate");
    }

    return [
        predObj.map(id),
        {
            fetch: opts.fetch || globalLinkOptsDefaults.fetch,
            forceRender: opts.forceRender || globalLinkOptsDefaults.forceRender,
            label: predObj,
            limit: opts.limit || globalLinkOptsDefaults.limit,
            name: propKey,
            returnType: opts.returnType || globalLinkOptsDefaults.returnType,
        },
    ];
}

function mapLabelMap(propKey: string, predObj: NamedNode, opts: LinkOpts): PropMapTuple {
    return [
        [id(predObj)],
        {
            fetch: opts.fetch || globalLinkOptsDefaults.fetch,
            forceRender: opts.forceRender || globalLinkOptsDefaults.forceRender,
            label: [predObj],
            limit: opts.limit || globalLinkOptsDefaults.limit,
            name: propKey,
            returnType: opts.returnType || globalLinkOptsDefaults.returnType,
        },
    ];
}

function mapLinkOptsMap(propKey: string, predObj: LinkOpts, opts: LinkOpts): PropMapTuple {
    const labels = normalizeType(predObj.label).filter(Boolean) as NamedNode[];

    if (predObj.label === undefined) {
        throw new TypeError(`Prop with key '${propKey}' contains no valid labels`);
    }

    return [
        labels.map(id),
        {
            fetch: predObj.fetch || opts.fetch || globalLinkOptsDefaults.fetch,
            forceRender: predObj.forceRender || opts.forceRender || globalLinkOptsDefaults.forceRender,
            label: normalizeType(predObj.label),
            limit: predObj.limit || opts.limit || globalLinkOptsDefaults.limit,
            linkedProp: predObj.linkedProp || opts.linkedProp,
            name: propKey,
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
    let requestedProperties: number[] = [];

    for (const propKey in mapDataToProps) {
        if (!mapDataToProps.hasOwnProperty(propKey)) {
            continue;
        }
        const predObj = mapDataToProps[propKey];
        const [ properties, mapping ] = dataPropToPropMap(propKey, predObj, opts);
        if (mapping.name.trim().length === 0) {
          throw new TypeError("Pass a valid prop label");
        }
        requestedProperties = requestedProperties.concat(...properties);
        propMap[mapping.name] = mapping;
    }

    return [ propMap, requestedProperties ];
}
