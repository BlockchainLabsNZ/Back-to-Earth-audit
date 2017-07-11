let GTKT = artifacts.require("StandardMintableToken");

const assertFail = require("../helpers/assertFail");

let gtkt;

let owner;
let frozen120addr;
let frozen365addr;

contract("GTKT", function(accounts) {
  beforeEach(async () => {

    owner = accounts[0];
    frozen120addr = accounts[4];
    frozen365addr = accounts[5];
    gtkt = await GTKT.new(
        "Gold Ticket",           // the token name
        8,                       // amount of decimal places in the token
        "GTKT",                  // the token symbol
        10000000000              // the initial distro amount
        );

    await gtkt.transfer(accounts[1], 50000, {
      from: accounts[0]
    });

    await gtkt.transfer(accounts[2], 50000, {
      from: accounts[0]
    });

  });

  /*
  * Burn you own
  */
  it("User can burn their own tokens", async () => {
    await gtkt.burn(50000, {
      from: accounts[1]
    });
    assert.equal((await gtkt.balanceOf.call(accounts[1])).toNumber(), 0);
  });

  it("User shouldn't be able to burn more tokens than they have", async () => {
    await assertFail(async () => {
      await gtkt.burn(99999, {
        from: accounts[1]
      });
    });
  });

  it("User shouldn't be able to double burn their tokens", async () => {
    await gtkt.burn(50000, {
      from: accounts[1]
    });

    assert.equal((await gtkt.balanceOf.call(accounts[1])).toNumber(), 0);
    await assertFail(async () => {
      await gtkt.burn(50000, {
        from: accounts[1]
      });
    });
  });

  /*
  * Burn others
  */
  it("User can also burn allowed tokens", async () => {
    await gtkt.approve(owner, 50000, {
      from: accounts[1]
    });

    assert.equal((await gtkt.allowance(accounts[1], owner)).toNumber(), 50000);

    await gtkt.burnFrom(accounts[1], 50000, { 
      from: owner
    });
    
    assert.equal((await gtkt.balanceOf.call(accounts[1])).toNumber(), 0);
  });

  it("User shouldn't be able to double burn allowed tokens", async () => {
    await gtkt.approve(owner, 25000, {
      from: accounts[1]
    });

    assert.equal((await gtkt.allowance(accounts[1], owner)).toNumber(), 25000);

    await assertFail(async () => {
      await Promise.all([
        gtkt.burnFrom(accounts[1], 25000, { 
          from: owner
        }), 
        gtkt.burnFrom(accounts[1], 25000, { 
          from: owner
        })
      ]);
    });
  });

  it("User should not be able to burn tokens unless they're allowed to", async () => {
    await assertFail(async () => {
      await gtkt.burnFrom(accounts[0], 50000, { 
        from: accounts[1]
      });
    });
  });
});
