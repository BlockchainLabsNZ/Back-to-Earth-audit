
let STRC = artifacts.require("StandardToken");

const assertFail = require("../helpers/assertFail");

let strc;

contract("STRC", function(accounts) {
  beforeEach(async () => {

    frozen120addr = accounts[4];
    frozen365addr = accounts[5];
    strc = await STRC.new(
        "StarCredits",   
        8,
        "STRC",
        
        100000000000000000000,         // the initial crowdfund distro amount
        50000000000000000000,          // the 120 day distro amount
        250000000000000000000,         // the 365 day distro amount
        frozen120addr,                 // the 120 day address 
        frozen365addr,                 // the 365 day address
        120,                           // amount of minutes to lock address120
        365);                          // amount of minutes to lock address365

    await strc.transfer(accounts[1], 50000, {
      from: accounts[0]
    });

    await strc.transfer(accounts[2], 50000, {
      from: accounts[0]
    });

  });

  /*
  * Burn you own
  */
  it("User can burn their own tokens", async () => {
    await strc.burn(50000, {
      from: accounts[0]
    });
    assert.equal((await strc.balanceOf.call(accounts[0])).toNumber(), 99999999999999850000);
  });

  it("User shouldn't be able to burn more tokens than they have", async () => {
    await assertFail(async () => {
      await strc.burn(100000000000000000001, {
        from: accounts[0]
      });
    });
  });

  it("User shouldn't be able to double burn their tokens", async () => {
    await strc.burn(99999999999999900000, {
      from: accounts[0]
    });

    assert.equal((await strc.balanceOf.call(accounts[0])).toNumber(), 0);
    await assertFail(async () => {
      await strc.burn(99999999999999900000, {
        from: accounts[0]
      });
    });
  });

  /*
  * Burn others
  */
  it("User can also burn allowed tokens", async () => {
    await strc.approve(accounts[1], 50000, {
      from: accounts[0]
    });

    assert.equal((await strc.allowance(accounts[0], accounts[1])).toNumber(), 50000);

    await strc.burnFrom(accounts[0], 50000, { 
      from: accounts[1]
    });
    assert.equal((await strc.balanceOf.call(accounts[0])).toNumber(), 99999999999999850000);
  });

  it("User shouldn't be able to double burn allowed tokens", async () => {
    await strc.approve(accounts[1], 50000, {
      from: accounts[0]
    });

    assert.equal((await strc.allowance(accounts[0], accounts[1])).toNumber(), 50000);

    await strc.burnFrom(accounts[0], 50000, { 
      from: accounts[1]
    });
    assert.equal((await strc.balanceOf.call(accounts[0])).toNumber(), 99999999999999850000);

    await assertFail(async () => {
      await strc.burnFrom(accounts[0], 50000, { 
        from: accounts[1]
      });
    });
  });

  it("User should not be able to burn tokens unless they're allowed to", async () => {
    await assertFail(async () => {
      await strc.burnFrom(accounts[0], 50000, { 
        from: accounts[1]
      });
    });
  });
});
