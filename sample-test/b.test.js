const sleep = require('./sleep');

describe( "suite B", ()=> {
  beforeEach(async ()=>{
    await sleep(50);
  });

  specify("200ms test", async ()=> {
    await sleep(200);
  });

  describe( "suite B.1", ()=> {
    specify("50ms test", async ()=> {
      await sleep(50);
    });
    specify("100ms test", async ()=> {
      await sleep(100);
    });
  });

  describe( "suite B.2", ()=> {
    specify("50ms test", async ()=> {
      await sleep(50);
    });
  });
});