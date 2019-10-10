const Mocha = require('mocha');
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END
} = Mocha.Runner.constants;

module.exports = function InstrumentationReporter(runner,options){
  console.log('InstrumentationReporter registering for events...');

    runner
      .once(EVENT_RUN_BEGIN, () => {
        console.log(EVENT_RUN_BEGIN);
      })
      .on(EVENT_RUN_END, () => {
        console.log(EVENT_RUN_END);
      })
      .on(EVENT_SUITE_BEGIN, () => {
        console.log(EVENT_SUITE_BEGIN);
      })
      .on(EVENT_SUITE_END, () => {
        console.log(EVENT_SUITE_END);
      });
}