import { Keypair, Networks, TransactionBuilder, rpc, xdr, Address, scValToNative, nativeToScVal } from '@stellar/stellar-sdk'
import { config } from '../config.js'

const server = new rpc.Server(config.stellar.rpcUrl)

export const stellarUtils = {
  async sendTransaction(tx: string, secret?: string) {
    const transaction = TransactionBuilder.fromXDR(tx, config.stellar.networkPassphrase)
    
    if (secret) {
      const sourceKeypair = Keypair.fromSecret(secret)
      transaction.sign(sourceKeypair)
    }

    const response = await server.sendTransaction(transaction)
    if (response.status !== 'PENDING') {
      throw new Error(`Transaction failed: ${JSON.stringify(response)}`)
    }

    // Wait for result
    let result = await server.getTransaction(response.hash)
    while (result.status === 'NOT_FOUND' || result.status === 'SUCCESS' && !result.resultXdr) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      result = await server.getTransaction(response.hash)
    }

    return result
  },

  scValToNative,
  nativeToScVal,
  
  getAddress(address: string) {
    return Address.fromString(address)
  }
}
