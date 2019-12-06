import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import "jest-enzyme";

Enzyme.configure({ adapter: new Adapter() });

// Suppress errors due to the fetcher binding on undefined.
(global as unknown as any).fetch = () => Promise.resolve();
(global as unknown as any).Response = class Response {};

/* An god smiled upon the stacktrace given. */
process.on("unhandledRejection", (reason) => {
  // tslint:disable-next-line no-console
  console.log("REJECTION", reason);
});
