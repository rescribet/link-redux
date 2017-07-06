import { Map } from 'immutable';
import rdf from 'rdflib';

import {
  FETCH_LINKED_OBJECT,
  LINKED_GRAPH_UPDATE,
} from './actions';

const initialState = new Map({
  items: {},
  versions: new Map(),
});

function sameNode(a, b) {
  return a.termType === b.termType
    && a.value === b.value;
}

function linkReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_LINKED_OBJECT:
      const { error, payload } = action;
      if (error !== true) {
        const id = payload.record['@id'] || payload.href;
        return state.set(
          'items',
          Object.assign(
            {},
            state.get('items') || {},
            {
              [id]: {
                href_url: payload.href,
                loading: payload.loading,
              },
            },
          ),
        );
      }
      return state;
    case LINKED_GRAPH_UPDATE:
      if (Array.isArray(action.payload)) {
        // const curState = state.get('items');
        // const updatedState = {};

        // let s, p;
        // action.payload.forEach((triple) => {
        //   if (typeof triple.object === 'undefined') {
        //     throw new Error('Invalid data');
        //   }
        //   s = triple.subject;
        //   p = triple.predicate;
        //
        //   // rdflib.js has the sameAs enhancement
        //   // const eqS = window.LRS.schema.equivalenceSet.add(triple.subject.value);
        //   // const eqP = window.LRS.schema.equivalenceSet.add(triple.predicate.value);
        //   //
        //   // const isSameAs = triple.predicate.value === 'http://www.w3.org/2002/07/owl#sameAs';
        //   // if (isSameAs) {
        //   //   window.LRS.schema.equivalenceSet.union(
        //   //     window.LRS.schema.equivalenceSet.add(triple.object.value),
        //   //     eqS,
        //   //   );
        //   // }
        //   // const s = isSameAs
        //   //   ? triple.subject.value
        //   //   : window.LRS.schema.equivalenceSet.find(eqS).value;
        //   // const p = window.LRS.schema.equivalenceSet.find(eqP).value;
        //   if (typeof updatedState[triple.subject] === 'undefined') {
        //     updatedState[triple.subject] = Object.assign({
        //       [new rdf.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#subject')]: {
        //         termType: 'NamedNode',
        //         value: triple.subject,
        //       },
        //     }, curState[triple.subject] && curState[triple.subject][triple.predicate]);
        //   }
        //   const curValue = updatedState[triple.subject][triple.predicate];
        //   let val;
        //   if (typeof curValue === 'undefined') {
        //     val = triple.object;
        //   } else if (Array.isArray(curValue)) {
        //     val = curValue.concat(triple.object);
        //   } else if (!sameNode(curValue, triple.object)) {
        //     val = [curValue, triple.object];
        //   } else {
        //     // debugger;
        //   }
        //   if (typeof val !== 'undefined') {
        //     updatedState[triple.subject][triple.predicate] = val;
        //   }
        // });

        const nextMap = state
          .get('versions')
          .withMutations((map) => {
            action.payload.forEach(s => map.set(
              s.subject,
              Math.random().toString(36).substr(2, 5),
            ));
          });

        return state.set(
          'versions',
          nextMap,
        );
        // Object.assign({}, state.get('items'), updatedState),
      }
      return state.set(
        'items',
        state.get('items').mergeDeep(action.payload),
      );
    default:
      return state;
  }
}

export default linkReducer;
