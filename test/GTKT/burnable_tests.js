let GTKT = artifacts.require("StandardMintableToken");

const assertFail = require("../helpers/assertFail");

let gtkt;

contract("GTKT", function(accounts) {
  beforeEach(async () => {

    frozen120addr = accounts[4];
    frozen365addr = accounts[5];
    gtkt = await GTKT.new(
        "Gold Ticket",               // the token name
        8,             // amount of decimal places in the token
        "GTKT",             // the token symbol
        100000000000000000000           // the initial distro amount
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
      from: accounts[0]
    });
    assert.equal((await gtkt.balanceOf.call(accounts[0])).toNumber(), 99999999999999850000);
  });

  it("User shouldn't be able to burn more tokens than they have", async () => {
    await assertFail(async () => {
      await gtkt.burn(100000000000000000001, {
        from: accounts[0]
      });
    });
  });

  it("User shouldn't be able to double burn their tokens", async () => {
    await gtkt.burn(99999999999999900000, {
      from: accounts[0]
    });

    assert.equal((await gtkt.balanceOf.call(accounts[0])).toNumber(), 0);
    await assertFail(async () => {
      await gtkt.burn(99999999999999900000, {
        from: accounts[0]
      });
    });
  });

  /*
  * Burn others
  */
  it("User can also burn allowed tokens", async () => {
    await gtkt.approve(accounts[1], 50000, {
      from: accounts[0]
    });

    assert.equal((await gtkt.allowance(accounts[0], accounts[1])).toNumber(), 50000);

    await gtkt.burnFrom(accounts[0], 50000, { 
      from: accounts[1]
    });
    assert.equal((await gtkt.balanceOf.call(accounts[0])).toNumber(), 99999999999999850000);
  });

  it("User shouldn't be able to double burn allowed tokens", async () => {
    await gtkt.approve(accounts[1], 50000, {
      from: accounts[0]
    });

    assert.equal((await gtkt.allowance(accounts[0], accounts[1])).toNumber(), 50000);

    await gtkt.burnFrom(accounts[0], 50000, { 
      from: accounts[1]
    });
    assert.equal((await gtkt.balanceOf.call(accounts[0])).toNumber(), 99999999999999850000);

    await assertFail(async () => {
      await gtkt.burnFrom(accounts[0], 50000, { 
        from: accounts[1]
      });
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
