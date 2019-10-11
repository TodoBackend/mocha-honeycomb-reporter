const Libhoney = require("libhoney");
const debug = require('debug')('mocha-honeycomb-reporter:honeycomb');

module.exports = function createHoneycombAdapter({writeKey,dataset}){
  const hny = new Libhoney({writeKey,dataset});

  function collectTestSpan(span){
    debug('sending %s span %s %s', span.type, span.spanId, span.name);
    const event = hny.newEvent();
    event.timestamp = new Date(span.start);
    event.add({
      name: span.name,
      duration_ms: span.duration,
      "trace.trace_id": span.traceId,
      "trace.span_id": span.spanId,
      "trace.parent_id": span.parentSpanId,
      "test-instrumentation.start": span.start,
      "test-instrumentation.end": span.end,
      "test-instrumentation.type": span.type,
    });
    event.send();
  }

  return {collectTestSpan};
}