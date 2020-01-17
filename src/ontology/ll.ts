import { createNS } from "@ontologies/core";

const ll = createNS("http://purl.org/link-lib/");

export default {
  ns: ll,

  /* classes */
  ErrorResource: ll("ErrorResource"),
  LoadingResource: ll("LoadingResource"),
  NoView: ll("NoView"),

  /* properties */
};
