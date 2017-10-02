var chai = require("chai");
var expect = chai.expect;
var sinon = require("sinon");
var rewire = require("rewire");
var Block = rewire("../../logic/block");
var ByteBuffer = require('bytebuffer');
var ed = require('../../helpers/ed');
var zSchema = require('../../helpers/z_schema');
var schema = new zSchema();
var transaction = require('../../logic/transaction');
var crypto = require('crypto');
var passphrase = 'oath polypody manumit effector half sigmoid abound osmium jewfish weed sunproof ramose';
var dummyKeypar = ed.makeKeypair(crypto.createHash('sha256').update(passphrase, 'utf8').digest());

describe("logic/block", function() {

    var dummyBlock, dummyTransactions;

    beforeEach(function(){

        dummyTransactions = [{
            "type": 0,
            "amount": 108910891000000,
            "fee": 5,
            "timestamp": 0,
            "recipientId": "15256762582730568272R",
            "senderId": "14709573872795067383R",
            "senderPublicKey": "35526f8a1e2f482264e5d4982fc07e73f4ab9f4794b110ceefecd8f880d51892",
            "signature": "f8fbf9b8433bf1bbea971dc8b14c6772d33c7dd285d84c5e6c984b10c4141e9fa56ace902b910e05e98b55898d982b3d5b9bf8bd897083a7d1ca1d5028703e03",
            "id": "8139741256612355994"
        },
            {
                "type": 0,
                "amount": 108910891000000,
                "fee": 3,
                "timestamp": 0,
                "recipientId": "6781920633453960895R",
                "senderId": "14709573872795067383R",
                "senderPublicKey": "35526f8a1e2f482264e5d4982fc07e73f4ab9f4794b110ceefecd8f880d51892",
                "signature": "e26edb739d93bb415af72f1c288b06560c0111c4505f11076ca20e2f6e8903d3b007309c0e04362bfeb8bf2021d0e67ce3c943bfe0c0193f6c9503eb6dfe750c",
                "id": "16622990339377112127"
            }
        ];

        dummyBlock = {
            "version": 0,
            "totalAmount": 217821782000000,
            "totalFee": 8,
            "reward": 30000000,
            "payloadHash": "b3cf5bb113442c9ba61ed0a485159b767ca181dd447f5a3d93e9dd73564ae762",
            "timestamp": 1506889306558,
            "numberOfTransactions": 2,
            "payloadLength": 8,
            "previousBlock": "1",
            "generatorPublicKey": "c950f1e6c91485d2e6932fbd689bba636f73970557fe644cd901a438f74883c5",
            "transactions": dummyTransactions,
            "blockSignature": "8c5f2b088eaf0634e1f6e12f94a1f3e871f21194489c76ad2aae5c1b71acd848bc7b158fa3b827e97f3f685c772bfe1a72d59975cbd2ccaa0467026d13bae50a"
        };
    });

    describe("when is imported", function() {
        it("should be a function", function(done) {
            expect(Block).to.be.a('function');
            setImmediate(function() {
                done();
            });
        });
    });

    describe("when is instantiated", function() {

        var ed, schema, transaction;

        beforeEach(function(){
            ed = 1;
            schema = 2;
            transaction = 3;
        });

        it("should be return an object", function(done) {
            var callback = sinon.spy();
            var block = new Block(ed, schema, transaction, callback);
            expect(block).to.be.an.instanceof(Object);
            done();
        });

        it("the scope should be initialized properly", function(done) {
            var callback = sinon.spy();
            var block = new Block(ed, schema, transaction, callback);
            setImmediate(function() {
                expect(callback.args[0][1].scope.ed).to.equal(ed);
                expect(callback.args[0][1].scope.schema).to.equal(schema);
                expect(callback.args[0][1].scope.transaction).to.equal(transaction);
                done();
            });
        });

        it("should call to callback", function(done) {
            var callback = sinon.spy();
            var block = new Block(ed, schema, transaction, callback);
            expect(callback.called).to.be.false;
            setImmediate(function() {
                expect(callback.called).to.be.true;
                expect(callback.calledOnce).to.be.true;
                expect(callback.calledWith(null, block));
                done();
            });
        });

    });

    describe("when we call to create()", function(){

        var bb = new ByteBuffer(1 + 4 + 32 + 32 + 8 + 8 + 64 + 64, true);
        bb.writeInt(123);
        bb.flip();
        var buffer = bb.toBuffer();

        beforeEach(function(){
            ed = ed;
            schema = schema;
            transaction = {getBytes: sinon.stub().returns(buffer), objectNormalize: sinon.stub().returnsArg(0)};
        });

        it("should be return a new block", function(done){
            var callback = function(err, instance){
                var data = {transactions: dummyTransactions,
                    timestamp: Date.now(),
                    previousBlock: {id: "1", height: 10},
                    keypair: dummyKeypar
                };

                var new_block = instance.create(data);
                expect(new_block).to.be.an.instanceof(Object);
                expect(new_block.totalFee).to.equal(8);
                expect(new_block.numberOfTransactions).to.equal(2);
                expect(new_block.transactions).to.have.lengthOf(2);
                done();
            };

            var block = new Block(ed, schema, transaction, callback);

        });
    });

    describe("when we call to sign()", function(){
        it("should be return a block signature with 128 of lenght", function(done){
            var callback = function(err, instance){
                var blockSignature = instance.sign(dummyBlock, dummyKeypar);
                expect(blockSignature).to.have.lengthOf(128);
                done();
            };

            var block = new Block(ed, schema, transaction, callback);
        });
    });

    describe("when we call to getBytes()", function(){
        it("should be return a Buffer", function(done){
            var callback = function(err, instance){
                var bytes = instance.getBytes(dummyBlock);
                expect(bytes).to.be.an.instanceof(Buffer);
                done();
            };

            var block = new Block(ed, schema, transaction, callback);
        });
    });

    describe("when we call to verifySignature()", function(){

        var bb = new ByteBuffer(1 + 4 + 32 + 32 + 8 + 8 + 64 + 64, true);
        bb.writeInt(123);
        bb.flip();
        var buffer = bb.toBuffer();

        beforeEach(function(){
            ed = ed;
            schema = schema;
            transaction = {getBytes: sinon.stub().returns(buffer), objectNormalize: sinon.stub().returnsArg(0)};
        });

        it("should be return a verified hash", function(done){
            var callback = function(err, instance){
                var verification = instance.verifySignature(dummyBlock);
                expect(verification).to.be.true;
                done();
            };

            var block = new Block(ed, schema, transaction, callback);
        });
    });
});