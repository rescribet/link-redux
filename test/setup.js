const Enzyme = require('enzyme')
require('jest-enzyme/lib/index.js')
const Adapter = require('enzyme-adapter-react-16')

Enzyme.configure({ adapter: new Adapter() })

// Suppress errors due to the fetcher binding on undefined.
global.fetch = () => Promise.resolve();
global.Response = class Response {};

/* An god smiled upon the stacktrace given. */
process.on('unhandledRejection', (reason) => {
  console.log('REJECTION', reason)
})
