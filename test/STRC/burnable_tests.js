
let STRC = artifacts.require("StandardToken");

const assertFail = require("../helpers/assertFail");
const BigNumber = require("bignumber.js");

let strc;

let owner;
let frozen120addr;
let frozen365addr;
contract("STRC", function(accounts) {
  beforeEach(async () => {

    owner = accounts[0];
    frozen120addr = accounts[4];
    frozen365addr = accounts[5];
    strc = await STRC.new(
        "StarCredits",   
        8,
        "STRC",
        
        10000000000,         // the initial crowdfund distro amount
        5000000000,          // the 120 day distro amount
        2500000000,          // the 365 day distro amount
        frozen120addr,            // the 120 day address 
        frozen365addr,            // the 365 day address
        120,                      // amount of minutes to lock address120
        365, { from: owner});                     // amount of minutes to lock address365

    await strc.transfer(accounts[1], 50000, {
      from: owner
    });

    await strc.transfer(accounts[2], 50000, {
      from: owner
    });

  });

  /*
  * Burn you own
  */
  it("User can burn their own tokens", async () => {
    await strc.burn(50000, {
      from: accounts[1]
    });
    assert.equal((await strc.balanceOf.call(accounts[1])).toNumber(), 0);
  });

  it("User shouldn't be able to burn more tokens than they have", async () => {
    await strc.burn(99999, {
      from: accounts[1]
    });

    assert.equal((await strc.balanceOf.call(accounts[1])).toNumber(), 50000);
  });

  it("User shouldn't be able to double burn their tokens", async () => {
    await strc.burn(50000, {
      from: accounts[1]
    });

    assert.equal((await strc.balanceOf.call(accounts[1])).toNumber(), 0);

    await strc.burn(50000, {
      from: accounts[1]
    });
    
    assert.equal((await strc.balanceOf.call(accounts[1])).toNumber(), 0);
  });

  /*
  * Burn others
  */
  it("User can also burn allowed tokens", async () => {
    await strc.approve(owner, 50000, {
      from: accounts[1]
    });

    assert.equal((await strc.allowance(accounts[1], owner)).toNumber(), 50000);

    await strc.burnFrom(accounts[1], 50000, { 
      from: owner
    });

    assert.equal((await strc.balanceOf.call(accounts[1])).toNumber(), 0);
  });

  it("User shouldn't be able to double burn allowed tokens", async () => {
    await strc.approve(owner, 25000, {
      from: accounts[1]
    });

    assert.equal((await strc.allowance(accounts[1], owner)).toNumber(), 25000);

    await assertFail(async () => {
      await Promise.all([
        strc.burnFrom(accounts[1], 25000, { 
          from: owner
        }), 
        strc.burnFrom(accounts[1], 25000, { 
          from: owner
        })
      ]);
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
