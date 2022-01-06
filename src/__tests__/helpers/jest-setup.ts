import "@testing-library/jest-dom";

// Suppress errors due to the fetcher binding on undefined.
(global as unknown as any).fetch = () => Promise.resolve();
(global as unknown as any).Response = class Response {};

/* An god smiled upon the stacktrace given. */
process.on("unhandledRejection", (reason) => {
  // tslint:disable-next-line no-console
  console.log("REJECTION", reason);
});
