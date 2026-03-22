import { AmmWithdrawLiquidity } from '../types'
import bs58 from 'bs58'
import {
  AccountMeta,
  AccountRole,
  AccountSignerMeta,
  address,
  createSolanaClient,
  getAddressEncoder,
  getProgramDerivedAddress,
  getStructCodec,
  getU128Codec,
  getU32Codec,
  getU64Codec,
  Instruction,
} from 'gill'
import {
  get_lexicographical_token_pda,
  get_lexicographical_tokens_addresses,
} from '../utils'

export default async function withdrawLiquidity(data: AmmWithdrawLiquidity) {
  try {
    const { rpc } = createSolanaClient({ urlOrMoniker: 'devnet' })

    //helper function to get all the required accounts
    const addressEncoder = getAddressEncoder()
    const position_seeds = await get_lexicographical_tokens_addresses(
      address(data.token_a_mint_account),
      address(data.token_b_mint_account),
      [addressEncoder.encode(address(data.nft_mint_account))],
    )
    const [position_address] = await getProgramDerivedAddress({
      programAddress: address("DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu"),
      seeds: position_seeds,
    })
    console.log("asdfghjkl;'", position_address);
    const position_account_data = (await rpc.getAccountInfo(position_address).send()).value?.data

    const position_codec = getStructCodec([
      ['start_tick', getU32Codec()],
      ['end_tick', getU32Codec()],
      ['liquidity', getU128Codec()],
    ])
    if (!position_account_data) {
      throw 'position account not found!'
    }
    const position_account = position_codec.decode(bs58.decode(position_account_data).slice(1))
    const createAmmAccounts: (AccountMeta | AccountSignerMeta)[] = await AmmaccountsCreator(data, position_account)
    console.log('Account Count:', createAmmAccounts.length)
    createAmmAccounts.forEach((acc, i) => console.log(`Index ${i}: ${acc.address}`))

    //using codecs to serialize the instruction data
    const codec = getStructCodec([['minimum_liquidity', getU64Codec()]])

    const createAmmData = codec.encode({
      minimum_liquidity: parseInt(data.minimum_liquidity),
    })

    const finalAmmData = new Uint8Array(1 + createAmmData.length)
    finalAmmData.set([2])
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

async function AmmaccountsCreator(
  data: AmmWithdrawLiquidity,
  position_account_struct: {
    start_tick: number
    liquidity: bigint
    end_tick: number
  } & {
    start_tick: number | bigint
    liquidity: number | bigint
    end_tick: number | bigint
  },
): Promise<(AccountMeta | AccountSignerMeta)[]> {
  const accounts: (AccountMeta | AccountSignerMeta)[] = []
  const addressEncoder = getAddressEncoder()

  // 0. liquidity_provider_account(signer, writable)
  // const admin = await createKeyPairSignerFromBytes(
  //   new Uint8Array([
  //     10, 92, 27, 184, 114, 49, 64, 68, 52, 212, 240, 162, 153, 140, 141, 89, 87, 248, 49, 41, 56, 143, 73, 183, 89,
  //     195, 22, 183, 89, 59, 194, 35, 227, 129, 76, 82, 217, 163, 19, 224, 13, 216, 217, 51, 54, 111, 34, 248, 164, 178,
  //     79, 111, 66, 116, 188, 189, 132, 117, 72, 191, 89, 77, 133, 134,
  //   ]),
  // )
  accounts.push({
    address: address(data.provider_account),
    // address: address(data.provider_account),
    // signer: admin,
    role: AccountRole.WRITABLE_SIGNER,
  })

  // 1. nft_mint_account (writable, signer)
  // const nft_signer = await generateKeyPairSigner()
  accounts.push({
    address: address(data.nft_mint_account),
    // signer: nft_signer,
    role: AccountRole.READONLY,
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

  //12. position_account(writable)
  const [position_account] = await getProgramDerivedAddress({
    programAddress: address("DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu"),
    seeds: await get_lexicographical_tokens_addresses(
      address(data.token_a_mint_account),
      address(data.token_b_mint_account),
      [addressEncoder.encode(address(data.nft_mint_account))],
    ),
  })
  accounts.push({
    address: position_account,
    role: AccountRole.WRITABLE,
  })

  //13.first_tick_array_account(writable)
  const startTickBuffer = Buffer.alloc(4)
  startTickBuffer.writeUInt32BE(Math.floor(Number(position_account_struct.start_tick) / 88), 0)
  const [first_tick_array_account] = await getProgramDerivedAddress({
    programAddress: address("DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu"),
    seeds: [startTickBuffer, addressEncoder.encode(amm_token_account_address)],
  })
  accounts.push({
    address: first_tick_array_account,
    role: AccountRole.WRITABLE,
  })

  //14.last_tick_array_account(writable)
  const lastTickBuffer = Buffer.alloc(4)
  lastTickBuffer.writeUInt32BE(Math.floor(Number(position_account_struct.end_tick) / 88), 0)

  const [last_tick_array_account] = await getProgramDerivedAddress({
    programAddress: address("DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu"),
    seeds: [lastTickBuffer, addressEncoder.encode(amm_token_account_address)],
  })

  accounts.push({
    address: last_tick_array_account,
    role: AccountRole.WRITABLE,
  })

  //15. start_bitmap_account(writable)
  const start_bitmap_index = Math.floor(position_account_struct.start_tick / 10000)
  const start_bitmap_index_buffer = Buffer.alloc(4)
  start_bitmap_index_buffer.writeUInt32BE(start_bitmap_index)
  const [start_bitmap_address] = await getProgramDerivedAddress({
    programAddress: address("DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu"),
    seeds: ['bitmap', start_bitmap_index_buffer, addressEncoder.encode(amm_token_account_address)],
  })
  console.log(start_bitmap_index_buffer, amm_token_account_address)

  accounts.push({
    address: start_bitmap_address,
    role: AccountRole.WRITABLE,
  })

  //16. end_bitmap_account(writable)
  const end_bitmap_index = Math.floor(position_account_struct.end_tick / 10000)
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

  return accounts
}
