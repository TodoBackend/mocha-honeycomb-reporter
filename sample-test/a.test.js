const sleep = require('./sleep');

describe( "suite A", ()=> {
  beforeEach(async ()=>{
    await sleep(250);
  });

  afterEach(async ()=>{
    await sleep(125);
  });

  specify("100ms test", async ()=> {
    await sleep(100);
  });

  specify("75ms test", async ()=> {
    await sleep(75);
  });

  describe( "suite A.1", ()=> {
    beforeEach(async ()=>{
      await sleep(100);
    });

    afterEach(async ()=>{
      await sleep(200);
    });

    specify("50ms test", async ()=> {
      await sleep(50);
    });
  });
});