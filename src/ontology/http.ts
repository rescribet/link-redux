import { createNS } from "@ontologies/core";

const http = createNS("http://www.w3.org/2011/http#");

export default {
  ns: http,

  /* properties */
  statusCode: http("statusCode"),
};
