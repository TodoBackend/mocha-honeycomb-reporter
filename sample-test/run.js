const Mocha = require('mocha');
const path = require('path');

const InstrumentationReporter = require('../lib/reporter');
const createHoneycombAdapter = require('../lib/honeycombAdapter');

const mocha = new Mocha();

mocha.addFile( path.join(__dirname, "a.test.js") );
mocha.addFile( path.join(__dirname, "b.test.js") );

const honeycombAdapter = createHoneycombAdapter({
  writeKey: process.env['HONEYCOMB_WRITE_KEY'],
  dataset: 'test-instrumentation-example'
});

const instrumentationReporterOptions = {
  spanCollector: honeycombAdapter.collectTestSpan
}

const runner = mocha.reporter(
  InstrumentationReporter,
  instrumentationReporterOptions
 ).run();