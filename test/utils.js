advanceTime = (time) => {
    return new Promise((resolve, reject) => {
      web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [time],
        id: new Date().getTime()
      }, (err, result) => {
        if (err) { return reject(err) }
        return resolve(result)
      })
    })
  }
  
  advanceBlock = () => {
    return new Promise((resolve, reject) => {
      web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: new Date().getTime()
      }, (err, result) => {
        if (err) { return reject(err) }
        const newBlockHash = web3.eth.getBlock('latest').hash
  
        return resolve(newBlockHash)
      })
    })
  }
  
  takeSnapshot = () => {
    return new Promise((resolve, reject) => {
      web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_snapshot',
        id: new Date().getTime()
      }, (err, snapshotId) => {
        if (err) { return reject(err) }
        return resolve(snapshotId)
      })
    })
  }
  
  revertToSnapShot = (id) => {
    return new Promise((resolve, reject) => {
      web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_revert',
        params: [id],
        id: new Date().getTime()
      }, (err, result) => {
        if (err) { return reject(err) }
        return resolve(result)
      })
    })
  }
  
  advanceTimeAndBlock = async (time) => {
    await advanceTime(time)
    await advanceBlock()
    return Promise.resolve(web3.eth.getBlock('latest'))
  }

  solToArray =  (arraySol) => {
    var arr = [];
    for(let i=0; i<arraySol.length; i++)
      arr.push(arraySol[i]);
    return arr;
  }

  subArrayBN = (array1, array2) =>{
    var arr = [];
    for(let i=0; i<array1.length; i++)
      arr.push(array1[i].sub(array2[i]))
    return arr;
  }

  expectThrow = async promise => {
    try {
      await promise;
    } catch (err) {
      const outOfGas = err.message.includes("out of gas");
      const invalidOpcode = err.message.includes("invalid opcode");
      const vmException = err.message.includes("VM Exception");
      assert(
        outOfGas || invalidOpcode || vmException,
        "Expected throw, got `" + err + "` instead"
      );
      return;
    }
    assert.fail("Expected throw not received");
  }

  equalArray = function(arr1, arr2){
    for(let i=0; i<arr1.length;i++){
      if(!(arr1[i]).eq(arr2[i]))
        return false;
    }
    return true;
  }
  
  subArray = function(arr1,arr2){
    var result =[]
    for(let i=0; i<arr1.length;i++){
      result.push(arr1[i].sub(arr2[i]))
    }
    return result;
  }
  
  addArray = function(arr1,arr2){
    var result =[]
    for(let i=0; i<arr1.length;i++){
      result.push(arr1[i].add(arr2[i]))
    }
    return result;
  }
  
  module.exports = {
    advanceTime,
    advanceBlock,
    advanceTimeAndBlock,
    takeSnapshot,
    revertToSnapShot,
    solToArray,
    subArrayBN,
    expectThrow,
    equalArray,
    addArray,
    subArray
  }