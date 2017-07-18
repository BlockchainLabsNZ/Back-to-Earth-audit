let GTKT = artifacts.require("StandardMintableToken");

const assertFail = require("../helpers/assertFail");

let gtkt;
let contribution;

contract("GTKT", function(accounts) {
  beforeEach(async () => {
    gtkt = await GTKT.new(
        "Gold Ticket",             // the token name
        8,                         // amount of decimal places in the token
        "GTKT",                    // the token symbol
        10000000000                // the initial distro amount
        );
  });

  it("Owner can mint", async () => {
    await gtkt.mintToken(accounts[1], 100);
    assert.equal((await gtkt.balanceOf.call(accounts[1])).toNumber(), 100);

    assert.equal((await gtkt.totalSupply.call()).toNumber(), 10000000000 + 100);
  });

  it("Only owner can mint", async () => {
    await assertFail(async () => {
        await gtkt.mintToken(accounts[1], 100, {
            from: accounts[1]
        });
    });
    assert.equal((await gtkt.balanceOf.call(accounts[1])).toNumber(), 0);

    assert.equal((await gtkt.totalSupply.call()).toNumber(), 10000000000);
  });
});
