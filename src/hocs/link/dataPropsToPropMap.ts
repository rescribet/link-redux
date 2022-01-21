import { isNamedNode, NamedNode } from "@ontologies/core";
import { normalizeType } from "link-lib";

import {
  DataToPropsMapping,
  LinkOpts,
  MapDataToPropsParam,
  PropMapTuple,
  PropParam,
} from "../../types";

import { globalLinkOptsDefaults } from "./globalLinkOptsDefaults";

function mapMultiLabelMap<K>(propKey: K, predObj: NamedNode[], opts: LinkOpts): PropMapTuple<K> {
    if (predObj.length === 0) {
        throw new TypeError("Props array must contain at least one predicate");
    }

    return [
        predObj,
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
        [predObj],
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
        labels,
        {
            fetch: predObj.fetch ?? opts.fetch ?? globalLinkOptsDefaults.fetch,
            forceRender: predObj.forceRender ?? opts.forceRender ?? globalLinkOptsDefaults.forceRender,
            label: normalizeType(predObj.label),
            limit: predObj.limit ?? opts.limit ?? globalLinkOptsDefaults.limit,
            linkedProp: predObj.linkedProp || opts.linkedProp,
            name: propKey,
            returnType: predObj.returnType ?? opts.returnType ?? globalLinkOptsDefaults.returnType,
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

export function dataPropsToPropMap<
  T extends MapDataToPropsParam = MapDataToPropsParam,
>(
  mapDataToProps: T,
  opts: LinkOpts,
): [DataToPropsMapping<T>, NamedNode[]] {
    let requestedProperties: NamedNode[] = [];

    const propMap = Object
      .keys(mapDataToProps)
      .reduce<DataToPropsMapping<T>>((acc, propKey) => {
        const predObj = mapDataToProps[propKey];
        const [ properties, mapping ] = dataPropToPropMap<keyof T>(propKey, predObj, opts);
        if ((mapping.name as string).trim().length === 0) {
          throw new TypeError("Pass a valid prop label");
        }
        requestedProperties = requestedProperties.concat(...properties);

        return {
          ...acc,
          [mapping.name]: mapping,
        };
      }, {} as any);

    return [ propMap, Array.from(new Set(requestedProperties)) ];
}
