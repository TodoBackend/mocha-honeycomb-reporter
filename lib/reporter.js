const uuid = require('uuid/v4');

const _Mocha = require('mocha');
// prefer to use a globally registered Mocha instance, if available.
const Mocha = (typeof window !== 'undefined' && window.Mocha) || _Mocha;

const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END,
  EVENT_TEST_BEGIN,
  EVENT_TEST_END,
  EVENT_HOOK_BEGIN,
  EVENT_HOOK_END,
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
    test.__InstrumentationReporter = {
      spanData: spanDataFromMochaThing('test',test)
    }
  }

  function hookBegin(hook){
    hook.__InstrumentationReporter = {
      spanData: spanDataFromMochaThing('hook',hook)
    }
  }

  function spanDataFromMochaThing(thingType,thing){
    const spanId = uuid();
    const parentSpanId = thing.parent.__InstrumentationReporter.spanData.spanId;

    return {
      traceId: traceId,
      spanId: spanId,
      parentSpanId: parentSpanId,
      type: thingType,
      start: Date.now(),
      name: thing.title,
    };
  }

  function thingEnd(thing){
    const spanData = thing.__InstrumentationReporter.spanData;
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
    .on(EVENT_SUITE_END, thingEnd)
    .on(EVENT_TEST_BEGIN,testBegin)
    .on(EVENT_TEST_END, thingEnd)
    .on(EVENT_HOOK_BEGIN,hookBegin)
    .on(EVENT_HOOK_END, thingEnd);
}

function decorateSpanWithCompletionFields(spanData){
  spanData.end = Date.now();
  spanData.duration = spanData.end - spanData.start;
}