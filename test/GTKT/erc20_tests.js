//let MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");
let GTKT = artifacts.require("StandardMintableToken");
const BigNumber = require("bignumber.js");

let gtkt;

let frozen120addr;
let frozen365addr;

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
  });

  // CREATION
  it("creation: should have imported an initial balance of 100000000000000000000 from the old Token", async () => {
    assert.equal(
      (await gtkt.balanceOf.call(accounts[0])).toNumber(),
      100000000000000000000
    );
  });

  // TRANSERS
  it("transfers: should transfer 100000000000000000000 to accounts[1] with accounts[0] having 100000000000000000000", async () => {
    watcher = gtkt.Transfer();
    await gtkt.transfer(accounts[1], 100000000000000000000, {
      from: accounts[0]
    });
    let logs = watcher.get();
    assert.equal(logs[0].event, "Transfer");
    assert.equal(logs[0].args.from, accounts[0]);
    assert.equal(logs[0].args.to, accounts[1]);
    assert.equal(logs[0].args.value.toNumber(), 100000000000000000000);
    assert.equal(await gtkt.balanceOf.call(accounts[0]), 0);
    assert.equal(
      (await gtkt.balanceOf.call(accounts[1])).toNumber(),
      100000000000000000000
    );
  });

  //Fails due to transfer throwing rather than returning 
  it("transfers: should fail when trying to transfer 100000000000000000001 to accounts[1] with accounts[0] having 100000000000000000000", async () => {
    await gtkt.transfer(
      accounts[1],
      new BigNumber(web3.toWei(100000000000000000001)),
      {
        from: accounts[0]
      }
    );
    assert.equal(
      (await gtkt.balanceOf.call(accounts[0])).toNumber(),
      100000000000000000000
    );
  });

  // APPROVALS 
  it("approvals: msg.sender should approve 100 to accounts[1]", async () => {
    watcher = gtkt.Approval();
    await gtkt.approve(accounts[1], 100, { from: accounts[0] });
    let logs = watcher.get();
    assert.equal(logs[0].event, "Approval");
    assert.equal(logs[0].args._owner, accounts[0]);
    assert.equal(logs[0].args._spender, accounts[1]);
    assert.strictEqual(logs[0].args._value.toNumber(), 100);

    assert.strictEqual(
      (await gtkt.allowance.call(accounts[0], accounts[1])).toNumber(),
      100
    );
  });

  it("approvals: msg.sender approves accounts[1] of 100 & withdraws 20 once.", async () => {
    watcher = gtkt.Transfer();
    await gtkt.approve(accounts[1], 100, { from: accounts[0] });

    assert.strictEqual((await gtkt.balanceOf.call(accounts[2])).toNumber(), 0);
    await gtkt.transferFrom(accounts[0], accounts[2], 20, {
      from: accounts[1]
    });

    var logs = watcher.get();
    assert.equal(logs[0].event, "Transfer");
    assert.equal(logs[0].args.from, accounts[0]);
    assert.equal(logs[0].args.to, accounts[2]);
    assert.strictEqual(logs[0].args.value.toNumber(), 20);

    assert.strictEqual(
      (await gtkt.allowance.call(accounts[0], accounts[1])).toNumber(),
      80
    );

    assert.strictEqual((await gtkt.balanceOf.call(accounts[2])).toNumber(), 20);
    await gtkt.balanceOf.call(accounts[0]);
    assert.equal(
      (await gtkt.balanceOf.call(accounts[0])).toNumber(),
      100000000000000000000
    );
  });

  it("approvals: msg.sender approves accounts[1] of 100 & withdraws 20 twice.", async () => {
    await gtkt.approve(accounts[1], 100, { from: accounts[0] });
    await gtkt.transferFrom(accounts[0], accounts[2], 20, {
      from: accounts[1]
    });
    await gtkt.transferFrom(accounts[0], accounts[2], 20, {
      from: accounts[1]
    });
    await gtkt.allowance.call(accounts[0], accounts[1]);

    assert.strictEqual(
      (await gtkt.allowance.call(accounts[0], accounts[1])).toNumber(),
      60
    );

    assert.strictEqual((await gtkt.balanceOf.call(accounts[2])).toNumber(), 40);

    assert.equal(
      (await gtkt.balanceOf.call(accounts[0])).toNumber(),
      100000000000000000000
    );
  });

  //should approve 100 of msg.sender & withdraw 50 & 60 (should fail).
  it("approvals: msg.sender approves accounts[1] of 100 & withdraws 50 & 60 (2nd tx should fail)", async () => {
    await gtkt.approve(accounts[1], 100, { from: accounts[0] });
    await gtkt.transferFrom(accounts[0], accounts[2], 50, {
      from: accounts[1]
    });
    assert.strictEqual(
      (await gtkt.allowance.call(accounts[0], accounts[1])).toNumber(),
      50
    );

    assert.strictEqual((await gtkt.balanceOf.call(accounts[2])).toNumber(), 50);

    assert.equal(
      (await gtkt.balanceOf.call(accounts[0])).toNumber(),
      100000000000000000000
    );
    await gtkt.transferFrom.call(accounts[0], accounts[2], 60, {
      from: accounts[1]
    });
    assert.strictEqual((await gtkt.balanceOf.call(accounts[2])).toNumber(), 50);
    assert.equal(
      (await gtkt.balanceOf.call(accounts[0])).toNumber(),
      100000000000000000000
    );
  });

  it("approvals: attempt withdrawal from account with no allowance (should fail)", async () => {
    await gtkt.transferFrom.call(accounts[0], accounts[2], 60, {
      from: accounts[1]
    });
    assert.equal(
      (await gtkt.balanceOf.call(accounts[0])).toNumber(),
      100000000000000000000
    );
  });

  it("approvals: allow accounts[1] 100 to withdraw from accounts[0]. Withdraw 60 and then approve 0 & attempt transfer.", async () => {
    await gtkt.approve(accounts[1], 100, { from: accounts[0] });
    await gtkt.transferFrom(accounts[0], accounts[2], 60, {
      from: accounts[1]
    });
    await gtkt.approve(accounts[1], 0, { from: accounts[0] });
    await gtkt.transferFrom.call(accounts[0], accounts[2], 10, {
      from: accounts[1]
    });
    assert.equal(
      (await gtkt.balanceOf.call(accounts[0])).toNumber(),
      100000000000000000000
    );
  });
});
