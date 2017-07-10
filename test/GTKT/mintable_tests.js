let GTKT = artifacts.require("StandardMintableToken");

const assertFail = require("../helpers/assertFail");

let gtkt;
let contribution;

contract("GTKT", function(accounts) {
  beforeEach(async () => {
    gtkt = await GTKT.new(
        "Gold Ticket",               // the token name
        8,             // amount of decimal places in the token
        "GTKT",             // the token symbol
        100000000000000000000           // the initial distro amount
        );
  });

  it("Controler and only controler can mint", async () => {
    await gtkt.mintToken(accounts[0], 100);
    assert.equal((await gtkt.balanceOf.call(accounts[0])).toNumber(), 100);

    //await gtkt.changeController(contribution.address);
    //await contribution.initialize(gtkt.address);

    //await assertFail(async () => {
    //  await gtkt.mintToken(accounts[0], 50000);
    //});

    //assert.equal((await gtkt.balanceOf.call(accounts[0])).toNumber(), 100);

    //await contribution.proxyPayment(accounts[0], { value: 50000 });
    //assert.equal((await gtkt.balanceOf.call(accounts[0])).toNumber(), 50100);
  });
});
