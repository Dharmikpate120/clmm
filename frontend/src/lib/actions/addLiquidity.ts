// 'use server'
import {
  AccountMeta,
  AccountRole,
  AccountSignerMeta,
  address,
  generateKeyPairSigner,
  getAddressEncoder,
  getF64Codec,
  getProgramDerivedAddress,
  getStructCodec,
  getU32Codec,
  Instruction,
} from 'gill'
import { AmmAddLiquidity } from '../types'
import { get_lexicographical_token_pda, get_lexicographical_tokens_addresses } from '../utils'
export default async function addLiquidity(data: AmmAddLiquidity) {
  try {

    //helper function to get all the required accounts
    const createAmmAccounts: (AccountMeta | AccountSignerMeta)[] = await AmmaccountsCreator(data)

    createAmmAccounts.forEach((acc, i) => console.log(`Index ${i}: ${acc.address}`))

    //using codecs to serialize the instruction data
    const codec = getStructCodec([
      ['liquidity', getF64Codec()],
      ['start_tick', getU32Codec()],
      ['end_tick', getU32Codec()],
    ])

    const createAmmData = codec.encode({
      liquidity: parseFloat(data.liquidity),
      start_tick: parseInt(data.start_tick),
      end_tick: parseInt(data.end_tick),
    })

    const finalAmmData = new Uint8Array(1 + createAmmData.length)
    finalAmmData.set([1])
    finalAmmData.set(createAmmData, 1)

    //addliquidity instruction creation
    const createAmmInstruction: Instruction = {
      accounts: createAmmAccounts,
      data: finalAmmData,
      programAddress: address("DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu"),
    }
    return createAmmInstruction;

    // const { value: blockhash } = await rpc.getLatestBlockhash().send()
    // // const baseTx = createTransaction({ version: 0 })
    // const createAmmTransaction = pipe(
    //   createTransactionMessage({ version: 'legacy' }),
    //   (tx) => setTransactionMessageFeePayer(address(data.provider_account), tx),
    //   (tx) => setTransactionMessageLifetimeUsingBlockhash(blockhash, tx),
    //   (tx) => appendTransactionMessageInstruction(createAmmInstruction, tx),
    // )

    // // const compiledTransactionMessage = compileTransactionMessage(createAmmTransaction)
    // //  as BaseTransactionMessage & TransactionMessageWithFeePayer;
    // // const basetx = getbasetransactio
    // // import { createSolanaRpcSubscriptions, address } from '@solana/kit';

    // // const rpcSubscriptions = createSolanaRpcSubscriptions('wss://api.mainnet-beta.solana.com');
    // const myAddress = address(data.provider_account)
    // const abortController = new AbortController()

    // async function subscribeToAccount() {
    //   const notifications = await rpcSubscriptions
    //     .accountNotifications(myAddress, { commitment: 'confirmed' })
    //     .subscribe({ abortSignal: abortController.signal })

    //   // The loop waits for new notifications automatically
    //   for await (const notification of notifications) {
    //     console.log('Account Updated! New balance:', notification.value.lamports)
    //     console.log('Slot:', notification.context.slot)
    //   }
    // }
    // async function subscribeToTransactions() {
    //   const logSubscription = await rpcSubscriptions
    //     .logsNotifications({ mentions: [myAddress] }, { commitment: 'confirmed' })
    //     .subscribe({ abortSignal: abortController.signal })

    //   for await (const log of logSubscription) {
    //     console.log('Transaction detected!')
    //     console.log('Signature:', log.value.signature)
    //     console.log('Logs:', log.value.logs)

    //     if (log.value.err) {
    //       console.error('Transaction failed:', log.value.err)
    //     }
    //   }
    // }
    // subscribeToAccount()
    // subscribeToTransactions()
    // // signTransaction([admin], compiledTransactionMessage)
    // const signedTx = await signTransactionMessageWithSigners(createAmmTransaction)
    // const encoder64 = getBase64EncodedWireTransaction(signedTx)
    // // const msg = encoder64.decode(sig)
    // const simulated = await rpc
    //   .simulateTransaction(encoder64, {
    //     encoding: 'base64',
    //     commitment: 'confirmed',
    //   })
    //   .send()
    // console.log(simulated.value.logs)
    // const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })
    // console.log(signedTx)
    // const signature = await sendAndConfirmTransaction(signedTx, { commitment: 'confirmed' })
    // console.log(signature)
    // // const { value: signature } = await factory(compiledTransactionMessage).send();
    // // return { instruction: createAmmInstruction }
    // abortController.abort()
  } catch (err) {
    console.log(err)
  } finally {
  }
}

async function AmmaccountsCreator(data: AmmAddLiquidity): Promise<(AccountMeta | AccountSignerMeta)[]> {
  const accounts: (AccountMeta | AccountSignerMeta)[] = []
  const addressEncoder = getAddressEncoder()

  // 0. liquidity_provider_account(signer, writable)
  accounts.push({
    address: address(data.provider_account),
    // address: address(data.provider_account),
    // signer: admin,
    role: AccountRole.WRITABLE_SIGNER,
  })

  // 1. nft_mint_account (writable, signer)
    const nft_signer = await generateKeyPairSigner()
    accounts.push({
      address: nft_signer.address,
      signer: nft_signer,
      role: AccountRole.WRITABLE_SIGNER,
    })
  
    // 2. amm_token_account (writable)
    const [amm_token_account_address] = await get_lexicographical_token_pda(
      address(data.token_a_mint_account),
      address(data.token_b_mint_account),
      address("DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu"),
    )
    accounts.push({
      address: address(amm_token_account_address),
      role: AccountRole.WRITABLE,
    })

    // 3. token A pool account (writable)
    const [token_a_pool_account_address] = await getProgramDerivedAddress({
      programAddress: address("DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu"),
      seeds: [
        'pool',
        addressEncoder.encode(address(amm_token_account_address)),
        addressEncoder.encode(address(data.token_a_mint_account)),
      ],
    })
    accounts.push({
      address: address(token_a_pool_account_address),
      role: AccountRole.WRITABLE,
    })
  
    // 4. token B pool account (writable)
    const [token_b_pool_account_address] = await getProgramDerivedAddress({
      programAddress: address("DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu"),
      seeds: [
        'pool',
        addressEncoder.encode(address(amm_token_account_address)),
        addressEncoder.encode(address(data.token_b_mint_account)),
      ],
    })
    accounts.push({
      address: address(token_b_pool_account_address),
      role: AccountRole.WRITABLE,
    })

    // 5. provider token A account (writable)
    accounts.push({
      address: address(data.provider_token_a_account),
      role: AccountRole.WRITABLE,
    })
  
    // 6. provider token B account (writable)
    accounts.push({
      address: address(data.provider_token_b_account),
      role: AccountRole.WRITABLE,
    })

    // 7. spl token program account (read only)
    accounts.push({
      address: address('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      role: AccountRole.READONLY,
    })
  
    // 8. token A mint account (read only)
    accounts.push({
      address: address(data.token_a_mint_account),
      role: AccountRole.READONLY,
    })
  
    // 9. token B mint account (read only)
    accounts.push({
      address: address(data.token_b_mint_account),
      role: AccountRole.READONLY,
    })
  
    //10. system program account (read only)
    accounts.push({
      address: address('11111111111111111111111111111111'),
      role: AccountRole.READONLY,
    })
    
    //11. amm_program_account (read only)
    accounts.push({
      address: address("DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu"),
      role: AccountRole.READONLY,
    })
    
    //12. metaplex_core_program_account(read only)
    accounts.push({
      address: address('CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'),
      role: AccountRole.READONLY,
    })
  
    //13. position_account(writable)
    const [position_account] = await getProgramDerivedAddress({
      programAddress: address("DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu"),
      seeds: await get_lexicographical_tokens_addresses(
        address(data.token_a_mint_account),
        address(data.token_b_mint_account),
        [addressEncoder.encode(nft_signer.address)],
      ),
    })
    accounts.push({
      address: position_account,
      role: AccountRole.WRITABLE,
    })
  
    //14.first_tick_array_account(writable)
    const startTickBuffer = Buffer.alloc(4)
    startTickBuffer.writeUInt32BE(Math.floor(Number(data.start_tick) / 88), 0)
    const [first_tick_array_account] = await getProgramDerivedAddress({
      programAddress: address("DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu"),
      seeds: [startTickBuffer, addressEncoder.encode(amm_token_account_address)],
    })
    console.log(`start tick index ${Math.floor(Number(data.start_tick) / 88)}, ${Math.floor(Number(data.end_tick) / 88)}`)
    accounts.push({
      address: first_tick_array_account,
      role: AccountRole.WRITABLE,
    })
  
    //15.last_tick_array_account(writable)
    const lastTickBuffer = Buffer.alloc(4)
    lastTickBuffer.writeUInt32BE(Math.floor(Number(data.end_tick) / 88), 0)
  
    const [last_tick_array_account] = await getProgramDerivedAddress({
      programAddress: address("DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu"),
      seeds: [lastTickBuffer, addressEncoder.encode(amm_token_account_address)],
    })
  
    accounts.push({
      address: last_tick_array_account,
      role: AccountRole.WRITABLE,
    })
  
    //16. start_bitmap_account(writable)
    const start_bitmap_index = Math.floor(parseInt(data.start_tick) / 10000)
    const start_bitmap_index_buffer = Buffer.alloc(4)
    start_bitmap_index_buffer.writeUInt32BE(start_bitmap_index)
    const [start_bitmap_address] = await getProgramDerivedAddress({
      programAddress: address("DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu"),
      seeds: ['bitmap', start_bitmap_index_buffer, addressEncoder.encode(amm_token_account_address)],
    })
    console.log(start_bitmap_index_buffer,amm_token_account_address)
  
    accounts.push({
      address: start_bitmap_address,
      role: AccountRole.WRITABLE,
    })
  
    //17v. end_bitmap_account(writable)
    const end_bitmap_index = Math.floor(parseInt(data.end_tick) / 10000)
    const end_bitmap_index_buffer = Buffer.alloc(4)
    end_bitmap_index_buffer.writeUInt32BE(end_bitmap_index)
  
    const [end_bitmap_address] = await getProgramDerivedAddress({
      programAddress: address("DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu"),
      seeds: ['bitmap', end_bitmap_index_buffer, addressEncoder.encode(amm_token_account_address)],
    })
  
    accounts.push({
      address: end_bitmap_address,
      role: AccountRole.WRITABLE,
    })
    
  
    
  
    // //10. sysvar_account (read only)
    // accounts.push({
    //   address: address('SysvarRent111111111111111111111111111111111'),
    //   role: AccountRole.READONLY,
    // })
  
  
  

  return accounts
}
