import { isNamedNode, NamedNode } from "@ontologies/core";
import { id, normalizeType } from "link-lib";

import { LinkOpts, MapDataToPropsParam, PropParam } from "../../types";
import { ProcessedLinkOpts } from "../link";

import { globalLinkOptsDefaults } from "./globalLinkOptsDefaults";

export type DataToPropsMapping<P = {}> = { [T in keyof P]: ProcessedLinkOpts<T> };

type PropMapTuple<K> = [number[], ProcessedLinkOpts<K>];

function mapMultiLabelMap<K>(propKey: K, predObj: NamedNode[], opts: LinkOpts): PropMapTuple<K> {
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

function mapLabelMap<K>(propKey: K, predObj: NamedNode, opts: LinkOpts): PropMapTuple<K> {
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

function mapLinkOptsMap<K>(propKey: K, predObj: LinkOpts, opts: LinkOpts): PropMapTuple<K> {
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

function dataPropToPropMap<T>(propKey: T, predObj: PropParam, opts: LinkOpts): PropMapTuple<T> {
    if (Array.isArray(predObj)) {
        return mapMultiLabelMap(propKey, predObj, opts);
    } else if (isNamedNode(predObj)) {
        return mapLabelMap(propKey, predObj, opts);
    }

    return mapLinkOptsMap(propKey, predObj, opts);
}

export function dataPropsToPropMap(
  mapDataToProps: MapDataToPropsParam,
  opts: LinkOpts,
): [DataToPropsMapping<typeof mapDataToProps>, number[]] {

    const propMap: DataToPropsMapping<typeof mapDataToProps> = {};
    let requestedProperties: number[] = [];

    for (const propKey in mapDataToProps) {
        if (!mapDataToProps.hasOwnProperty(propKey)) {
            continue;
        }
        const predObj = mapDataToProps[propKey];
        const [ properties, mapping ] = dataPropToPropMap<keyof typeof mapDataToProps>(propKey, predObj, opts);
        if (typeof mapping.name === "number" || mapping.name.trim().length === 0) {
          throw new TypeError("Pass a valid prop label");
        }
        requestedProperties = requestedProperties.concat(...properties);
        propMap[mapping.name] = mapping;
    }

    return [ propMap, requestedProperties ];
}
