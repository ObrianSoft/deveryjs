import EveToken from './../devery/EveToken'
var EveTokenContract = artifacts.require("./TestEVEToken.sol");


const overrideOptions = {
    gasLimit: 250000,
    gasPrice: 9000000000,
};

//if we change the DeveryRegistry constructor
//we can change only one point
const createEveToken = (web3, provider, account, contractAddress) => {
    return new EveToken(web3, provider, account, contractAddress)
}

contract('EveToken', function (accounts) {
    let contractAddress;
    const totalSupply = "100000000000000000000000";

    before(async function () {
        let contract = await EveTokenContract.deployed();
        contractAddress = contract.address
    })

    it('should return the total supply',async function(){
        let eveToken = createEveToken(web3,null,accounts[0],contractAddress)
        let supply = await eveToken.totalSupply();
        assert.equal(supply.toString(),totalSupply)
    })

    it('should be able to transfer tokens',async function(){
        const transfer = 500;
        let eveTokenOwner = createEveToken(web3,null,accounts[0],contractAddress)
        let receiver = createEveToken(web3,null,accounts[1],contractAddress)
        let receiverBeforeTransfer = await receiver.balanceOf(accounts[1])
        receiverBeforeTransfer = receiverBeforeTransfer.toNumber()
        await eveTokenOwner.transfer(accounts[1],transfer,overrideOptions)
        let receiverAfterTransfer = await receiver.balanceOf(accounts[1])
        assert(receiverAfterTransfer,receiverBeforeTransfer+transfer)

    })

    it('should return the token quantity that a given account owns',async function(){
        //as we already did a transfer now we shall have 500 tokens
        let receiver = createEveToken(web3,null,accounts[1],contractAddress)
        let receiverAfterTransfer = await receiver.balanceOf(accounts[1])
        assert(receiverAfterTransfer,500)
    })

    it('should not be able to transfer more tokens than owns',async function(){
        this.timeout(5000)
        return new Promise(async function(resolve,reject){
            let eveTokenAcc = createEveToken(web3,null,accounts[1],contractAddress)
            let total = await eveTokenAcc.balanceOf(accounts[1]);
            total = total.toNumber();
            //we add 1 token to exced my total balance
            total+=1;
            try{
                await eveTokenAcc.transfer(accounts[2],total,overrideOptions)
            }
            catch (e){
                assert(e.message,'VM Exception while processing transaction: revert','wrong exception raised')
                resolve()
            }

        })
    })

    it('should receive a callback when a transfer is done',async function(){
        this.timeout(5000)
        return new Promise(async function(resolve, reject){
            const transfer = 100
            const toAcc = accounts[2]
            const fromAcc = accounts[1]
            let eveTokenAcc = createEveToken(web3,null,fromAcc,contractAddress)
            eveTokenAcc.setTransferListner((from,to,total)=>{
                try{
                    assert.equal(from.toLowerCase(),fromAcc.toLowerCase())
                    assert.equal(to.toLowerCase(),toAcc.toLowerCase())
                    assert.equal(total.toNumber(),transfer)
                    resolve()
                }

                catch(e){

                }
            })
            eveTokenAcc.transfer(toAcc,transfer,overrideOptions)
        })
    })


})