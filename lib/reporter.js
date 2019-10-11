const uuid = require('uuid/v4');

const _Mocha = require('mocha');
// prefer to use a globally registered Mocha instance, if available.
const Mocha = (typeof window !== 'undefined' && window.Mocha) || _Mocha;

const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_BEGIN,
  EVENT_TEST_END,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END
} = Mocha.Runner.constants;

const noop = () => {}

module.exports = function InstrumentationReporter(runner,mochaOptions){
  const spanCollector = mochaOptions.reporterOptions.spanCollector || noop;

  const traceId = uuid();
  let rootSpan = null;

  function runBegin(){
    rootSpan = {
      traceId: traceId,
      spanId: traceId,
      parentSpanId: null,
      type: 'run',
      start: Date.now(),
      name: 'Test Run' 
    };
  }

  function runEnd(){
    decorateSpanWithCompletionFields(rootSpan);
    outputSpan(rootSpan);
  }

  function suiteBegin(suite){
    const spanId = uuid();

    const parentSpan = (suite.parent && suite.parent.__InstrumentationReporter.spanData);
    const parentSpanId = (parentSpan && parentSpan.spanId) || traceId;

    const spanData = {
      traceId: traceId,
      spanId: spanId,
      parentSpanId: parentSpanId,
      type: 'suite',
      start: Date.now(),
      name: suite.title,
    };

    suite.__InstrumentationReporter = {spanData:spanData};
  }

  function testBegin(test){
    const spanId = uuid();
    const parentSpanId = test.parent.__InstrumentationReporter.spanData.spanId;

    const spanData = {
      traceId: traceId,
      spanId: spanId,
      parentSpanId: parentSpanId,
      type: 'test',
      start: Date.now(),
      name: test.title,
    };

    test.__InstrumentationReporter = {spanData:spanData};
  }

  function testOrSuiteEnd(testOrSuite){
    const spanData = testOrSuite.__InstrumentationReporter.spanData;
    decorateSpanWithCompletionFields(spanData);
    outputSpan(spanData);
  }

  function outputSpan(spanData){
    spanCollector(spanData);
  }

  runner
    .on(EVENT_RUN_BEGIN,runBegin)
    .on(EVENT_RUN_END, runEnd)
    .on(EVENT_SUITE_BEGIN, suiteBegin)
    .on(EVENT_SUITE_END, testOrSuiteEnd)
    .on(EVENT_TEST_BEGIN,testBegin)
    .on(EVENT_TEST_END, testOrSuiteEnd);
}

function decorateSpanWithCompletionFields(spanData){
  spanData.end = Date.now();
  spanData.duration = spanData.end - spanData.start;
}