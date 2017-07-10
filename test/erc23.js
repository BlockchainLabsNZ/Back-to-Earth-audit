var Token = artifacts.require("StandardToken");
var ContractReceiverOverrider = artifacts.require(
  "./helpers/ContractReceiverOverrider.sol"
);

contract("Token ERC23", function(accounts) {
  // CREATION
  it("creation: should create an initial balance of 10000000000000000 for the creator", function(
    done
  ) {
    var ctr;
    Token.new({ from: accounts[0] })
      .then(function(result) {
        ctr = result;
        return ctr.balanceOf.call(accounts[0]);
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 10000000000000000);
        done();
      })
      .catch(done);
  });

  // TRANSERS
  it("transfers: should transfer 10000000000000000 to accounts[1] with accounts[0] having 10000000000000000", function(
    done
  ) {
    var ctr;
    Token.new({ from: accounts[0] })
      .then(function(result) {
        ctr = result;
        return ctr.transfer(accounts[1], 10000000000000000, "YES-hello", {
          from: accounts[0]
        });
      })
      .then(function(result) {
        var logs = result.logs;
        assert.equal(logs[0].event, "Transfer");
        assert.equal(logs[0].args.from, accounts[0]);
        assert.equal(logs[0].args.to, accounts[1]);
        assert.strictEqual(logs[0].args.value.toNumber(), 10000000000000000);
        return ctr.balanceOf.call(accounts[0]);
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 0);
        return ctr.balanceOf.call(accounts[1]);
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 10000000000000000);
        done();
      })
      .catch(done);
  });

  // TODO: create test (HERE) checking for this event to make sure
  //       that contracts will override the empty function.
  // This was checked successfully manualy.
  it("transfers: should transfer 10000000000000000 to overrider contract with accounts[0] having 10000000000000000", function(
    done
  ) {
    var ctr, receiver;
    Token.new({ from: accounts[0] })
      .then(function(result) {
        ctr = result;
        return ContractReceiverOverrider.new({ from: accounts[0] });
      })
      .then(function(result) {
        receiver = result;
        return ctr.transfer(receiver.address, 10000000000000000, "YES-hello", {
          from: accounts[0]
        });
      })
      .then(function(result) {
        var logs = result.logs;
        assert.equal(logs[0].event, "Transfer");
        assert.equal(logs[0].args.from, accounts[0]);
        assert.equal(logs[0].args.to, receiver.address);
        assert.strictEqual(logs[0].args.value.toNumber(), 10000000000000000);
        return ctr.balanceOf.call(accounts[0]);
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 0);
        return ctr.balanceOf.call(receiver.address);
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 10000000000000000);
        done();
      })
      .catch(done);
  });

  it("transfers: should fail when trying to transfer 10000000000000001 to accounts[1] with accounts[0] having 10000000000000000", function(
    done
  ) {
    var ctr;
    Token.new({ from: accounts[0] })
      .then(function(result) {
        ctr = result;
        return ctr.transfer(accounts[1], 10000000000000000, "YES-hello", {
          from: accounts[0]
        });
      })
      .then(function(result) {
        return ctr.transfer.call(accounts[1], 1, { from: accounts[0] });
      })
      .then(function(result) {
        assert.isFalse(result);
        done();
      })
      .catch(done);
  });

  it("transfers: should fail when trying to transfer zero.", function(done) {
    var ctr;
    Token.new({ from: accounts[0] })
      .then(function(result) {
        ctr = result;
        return ctr.transfer.call(accounts[1], 0, "YES-hello", {
          from: accounts[0]
        });
      })
      .then(function(result) {
        assert.isFalse(result);
        done();
      })
      .catch(done);
  });

  // APPROVALS
  it("approvals: msg.sender should approve 100 to accounts[1]", function(done) {
    var ctr;
    Token.new({ from: accounts[0] })
      .then(function(result) {
        ctr = result;
        return ctr.approve(accounts[1], 100, { from: accounts[0] });
      })
      .then(function(result) {
        var logs = result.logs;
        assert.equal(logs[0].event, "Approval");
        assert.equal(logs[0].args.from, accounts[0]);
        assert.equal(logs[0].args.to, accounts[1]);
        assert.strictEqual(logs[0].args.value.toNumber(), 100);
        return ctr.allowance.call(accounts[0], accounts[1]);
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 100);
        done();
      })
      .catch(done);
  });

  it("approvals: msg.sender approves accounts[1] of 100 & withdraws 20 once.", function(
    done
  ) {
    var ctr;
    Token.new({ from: accounts[0] })
      .then(function(result) {
        ctr = result;
        return ctr.approve(accounts[1], 100, { from: accounts[0] });
      })
      .then(function(result) {
        return ctr.balanceOf.call(accounts[2]);
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 0);
        return ctr.transferFrom(accounts[0], accounts[2], 20, {
          from: accounts[1]
        });
      })
      .then(function(result) {
        var logs = result.logs;
        assert.equal(logs[0].event, "Transfer");
        assert.equal(logs[0].args.from, accounts[0]);
        assert.equal(logs[0].args.to, accounts[2]);
        assert.strictEqual(logs[0].args.value.toNumber(), 20);
        return ctr.allowance.call(accounts[0], accounts[1]);
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 80);
        return ctr.balanceOf.call(accounts[2]);
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 20);
        return ctr.balanceOf.call(accounts[0]);
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 9999999999999980);
        done();
      })
      .catch(done);
  });

  it("approvals: msg.sender approves accounts[1] of 100 & withdraws 20 twice.", function(
    done
  ) {
    var ctr;
    Token.new({ from: accounts[0] })
      .then(function(result) {
        ctr = result;
        return ctr.approve(accounts[1], 100, { from: accounts[0] });
      })
      .then(function(result) {
        return ctr.transferFrom(accounts[0], accounts[2], 20, {
          from: accounts[1]
        });
      })
      .then(function(result) {
        return ctr.transferFrom(accounts[0], accounts[2], 20, {
          from: accounts[1]
        });
      })
      .then(function(result) {
        return ctr.allowance.call(accounts[0], accounts[1]);
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 60);
        return ctr.balanceOf.call(accounts[2]);
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 40);
        return ctr.balanceOf.call(accounts[0]);
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 9999999999999960);
        done();
      })
      .catch(done);
  });

  //should approve 100 of msg.sender & withdraw 50 & 60 (should fail).
  it("approvals: msg.sender approves accounts[1] of 100 & withdraws 50 & 60 (2nd tx should fail)", function(
    done
  ) {
    var ctr;
    Token.new({ from: accounts[0] })
      .then(function(result) {
        ctr = result;
        return ctr.approve(accounts[1], 100, { from: accounts[0] });
      })
      .then(function(result) {
        return ctr.transferFrom(accounts[0], accounts[2], 50, {
          from: accounts[1]
        });
      })
      .then(function(result) {
        return ctr.allowance.call(accounts[0], accounts[1]);
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 50);
        return ctr.balanceOf.call(accounts[2]);
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 50);
        return ctr.balanceOf.call(accounts[0]);
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 9999999999999950);
        return ctr.transferFrom.call(accounts[0], accounts[2], 60, {
          from: accounts[1]
        });
      })
      .then(function(result) {
        assert.isFalse(result);
        done();
      })
      .catch(done);
  });

  it("approvals: attempt withdrawal from acconut with no allowance (should fail)", function(
    done
  ) {
    var ctr = null;
    Token.new({ from: accounts[0] })
      .then(function(result) {
        ctr = result;
        return ctr.transferFrom.call(accounts[0], accounts[2], 60, {
          from: accounts[1]
        });
      })
      .then(function(result) {
        assert.isFalse(result);
        done();
      })
      .catch(done);
  });

  it("approvals: allow accounts[1] 100 to withdraw from accounts[0]. Withdraw 60 and then approve 0 & attempt transfer.", function(
    done
  ) {
    var ctr = null;
    Token.new({ from: accounts[0] })
      .then(function(result) {
        ctr = result;
        return ctr.approve(accounts[1], 100, { from: accounts[0] });
      })
      .then(function(result) {
        return ctr.transferFrom(accounts[0], accounts[2], 60, {
          from: accounts[1]
        });
      })
      .then(function(result) {
        return ctr.approve(accounts[1], 0, { from: accounts[0] });
      })
      .then(function(result) {
        return ctr.transferFrom.call(accounts[0], accounts[2], 10, {
          from: accounts[1]
        });
      })
      .then(function(result) {
        assert.isFalse(result);
        done();
      })
      .catch(done);
  });

  it("creation: test correct setting of vanity information", function(done) {
    var ctr;
    Token.new({ from: accounts[0] })
      .then(function(result) {
        ctr = result;
        return ctr.name.call();
      })
      .then(function(result) {
        assert.strictEqual(result, "MobileGo Token");
        return ctr.decimals.call();
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 8);
        return ctr.symbol.call();
      })
      .then(function(result) {
        assert.strictEqual(result, "MGO");
        done();
      })
      .catch(done);
  });

  // BURNING
  it("burning: owner of the contract is able to burn tokens", function(done) {
    var ctr;
    Token.new({ from: accounts[0] })
      .then(function(result) {
        ctr = result;
        return ctr.amountBurned.call();
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 0);
        return ctr.burn(100, "here", { from: accounts[0] });
      })
      .then(function(result) {
        var logs = result.logs;
        assert.equal(logs[0].event, "Burn");
        assert.equal(logs[0].args.from, accounts[0]);
        assert.strictEqual(logs[0].args.amount.toNumber(), 100);
        return ctr.balanceOf.call(accounts[0]);
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 9999999999999900);
        //   return ctr.totalSupply.call();
        // }).then(function(result) {
        //   assert.strictEqual(result.toNumber(), 9999999999999900);
        return ctr.amountBurned.call();
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 100);
        done();
      })
      .catch(done);
  });

  it("burning: non owner of the contract is unable to burn tokens", function(
    done
  ) {
    var ctr;
    Token.new({ from: accounts[0] })
      .then(function(result) {
        ctr = result;
        return ctr.burn.call(100, "here", { from: accounts[1] });
      })
      .then(function(result) {
        assert.isFalse(result);
        return ctr.amountBurned.call();
      })
      .then(function(result) {
        assert.strictEqual(result.toNumber(), 0);
        done();
      })
      .catch(done);
  });

  it("burning: owner can only burn it's own tokens.", function(done) {
    var ctr;
    Token.new({ from: accounts[0] })
      .then(function(result) {
        ctr = result;
        return ctr.transfer(accounts[1], 5000000000000000, "YES-hello", {
          from: accounts[0]
        });
      })
      .then(function(result) {
        return ctr.burn.call(6000000000000000, "here", { from: accounts[0] });
      })
      .then(function(result) {
        assert.isFalse(result);
        done();
      })
      .catch(done);
  });

  it("burning: won't burn 0 tokens.", function(done) {
    var ctr;
    Token.new({ from: accounts[0] })
      .then(function(result) {
        ctr = result;
        return ctr.transfer(accounts[1], 5000000000000000, "YES-hello", {
          from: accounts[0]
        });
      })
      .then(function(result) {
        return ctr.burn.call(0, { from: accounts[0] });
      })
      .then(function(result) {
        assert.isFalse(result);
        done();
      })
      .catch(done);
  });
});
