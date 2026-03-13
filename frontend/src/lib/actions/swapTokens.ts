'use server'
import {
  AccountMeta,
  AccountRole,
  AccountSignerMeta,
  address,
  appendTransactionMessageInstruction,
  BaseTransactionMessage,
  compileTransactionMessage,
  createKeyPairFromBytes,
  createKeyPairSignerFromBytes,
  createSolanaClient,
  createTransaction,
  createTransactionMessage,
  getAddressCodec,
  getAddressEncoder,
  getBase64Decoder,
  getBase64EncodedWireTransaction,
  getBase64Encoder,
  getEnumCodec,
  getProgramDerivedAddress,
  getStructCodec,
  getU64Codec,
  Instruction,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransaction,
  signTransactionMessageWithSigners,
  TransactionMessageWithFeePayer,
  TransactionSigner,
} from 'gill'
import bs58 from 'bs58'
import { clmmTokenAccountType, SwapTokens } from '../types'
import * as borsh from 'borsh'
import { clmm_token_account_decoder, get_lexicographical_token_pda, get_lexicographical_tokens_addresses } from '../utils'
import { error } from 'console'

export default async function swapTokens(data: SwapTokens) {
  'use server'
  try {
    // if (data.provider_account !== process.env.ADMIN_ACCOUNT) {
    //     return { error: 'Unauthorized' }
    // }

    const { rpc, rpcSubscriptions } = createSolanaClient({ urlOrMoniker: 'devnet' })

    const [clmm_token_account_pda] =await getProgramDerivedAddress({
      programAddress: address(process.env.AMM_PROGRAM_ADDRESS!),
      seeds:await get_lexicographical_tokens_addresses(address(data.token_a_mint_account), address(data.token_b_mint_account), [])
    });
    console.log("pda: ", clmm_token_account_pda)
    const clmm_token_account = await rpc.getAccountInfo(clmm_token_account_pda, {encoding: "base64"}).send();
    let decoded_token_data;
    if (clmm_token_account.value?.data){
      decoded_token_data = clmm_token_account_decoder(clmm_token_account.value?.data[0]);
    }else{
      throw "clmm token account not found!";
    }
// asdfghjkl;'
const addressEncoder = getAddressCodec();
    const bitmap_index_one = Buffer.alloc(4);
  bitmap_index_one.writeInt32BE(Math.floor(decoded_token_data.current_tick / 10000));
    const [amm_token_account_address] = await get_lexicographical_token_pda(
    address(data.token_a_mint_account),
    address(data.token_b_mint_account),
    address(process.env.AMM_PROGRAM_ADDRESS!),
  )
  const [bitmap_account_one_pda] = await getProgramDerivedAddress({
    programAddress:address(process.env.AMM_PROGRAM_ADDRESS!),
    seeds:["bitmap", bitmap_index_one, addressEncoder.encode(amm_token_account_address) ]
  })
  const bitmap_account_data = await rpc.getAccountInfo(bitmap_account_one_pda, {encoding: "base64"}).send();
  if (bitmap_account_data?.value?.data){

    console.log(bitmap_index_one,bitmap_account_data.value?.data[0][0]);
  }
    //helper function to get all the required accounts
    const createAmmAccounts: (AccountMeta | AccountSignerMeta)[] = await AmmaccountsCreator(data, decoded_token_data);

    console.log('Account Count:', createAmmAccounts.length)
    createAmmAccounts.forEach((acc, i) => console.log(`Index ${i}: ${acc.address}`))

    //using codecs to serialize the instruction data
    const codec = getStructCodec([
      ['amount_in', getU64Codec()],
      ['minimum_amount_out', getU64Codec()],
      ['mint_address_in', getAddressCodec()],
      ['mint_address_out', getAddressCodec()],
    ])

    const createAmmData = codec.encode({
      amount_in: parseInt(data.max_amount_in),
      minimum_amount_out: parseInt(data.minimum_amount_out),
      mint_address_in: address(data.token_a_mint_account),
      mint_address_out: address(data.token_b_mint_account),
    })

    const finalAmmData = new Uint8Array(1 + createAmmData.length)
    finalAmmData.set([3])
    finalAmmData.set(createAmmData, 1)

    //addliquidity instruction creation
    const createAmmInstruction: Instruction = {
      accounts: createAmmAccounts,
      data: finalAmmData,
      programAddress: address(process.env.AMM_PROGRAM_ADDRESS!),
    }
    // return createAmmInstruction;
    const { value: blockhash } = await rpc.getLatestBlockhash().send()
    // const baseTx = createTransaction({ version: 0 })
    const createAmmTransaction = pipe(
      createTransactionMessage({ version: 'legacy' }),
      (tx) => setTransactionMessageFeePayer(address(data.swapper_account), tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(blockhash, tx),
      (tx) => appendTransactionMessageInstruction(createAmmInstruction, tx),
    )

    // const compiledTransactionMessage = compileTransactionMessage(createAmmTransaction)
    //  as BaseTransactionMessage & TransactionMessageWithFeePayer;
    // const basetx = getbasetransactio
    // import { createSolanaRpcSubscriptions, address } from '@solana/kit';

    // const rpcSubscriptions = createSolanaRpcSubscriptions('wss://api.mainnet-beta.solana.com');
    const myAddress = address(data.swapper_account)
    const abortController = new AbortController()

    async function subscribeToAccount() {
      const notifications = await rpcSubscriptions
        .accountNotifications(myAddress, { commitment: 'confirmed' })
        .subscribe({ abortSignal: abortController.signal })

      // The loop waits for new notifications automatically
      for await (const notification of notifications) {
        console.log('Account Updated! New balance:', notification.value.lamports)
        console.log('Slot:', notification.context.slot)
      }
    }
    async function subscribeToTransactions() {
      const logSubscription = await rpcSubscriptions
        .logsNotifications({ mentions: [myAddress] }, { commitment: 'confirmed' })
        .subscribe({ abortSignal: abortController.signal })

      for await (const log of logSubscription) {
        console.log('Transaction detected!')
        console.log('Signature:', log.value.signature)
        console.log('Logs:', log.value.logs)

        if (log.value.err) {
          console.error('Transaction failed:', log.value.err)
        }
      }
    }
    subscribeToAccount()
    subscribeToTransactions()
    // signTransaction([admin], compiledTransactionMessage)
    // const compiledTx = compileTransactionMessage(createAmmTransaction)
    // return compiledTx;
    const signedTx = await signTransactionMessageWithSigners(createAmmTransaction)
    const encoder64 = getBase64EncodedWireTransaction(signedTx)
    // const msg = encoder64.decode(sig)
    const simulated = await rpc
      .simulateTransaction(encoder64, {
        encoding: 'base64',
        commitment: 'confirmed',
      })
      .send()
    console.log(simulated.value.logs)
    const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })
    console.log(signedTx)
    const signature = await sendAndConfirmTransaction(signedTx, { commitment: 'confirmed' })
    console.log(signature)
    // const { value: signature } = await factory(compiledTransactionMessage).send();
    // return { instruction: createAmmInstruction }
    abortController.abort()
  } catch (err) {
    console.log(err)
  }
}
async function AmmaccountsCreator(data: SwapTokens, decoded_token_data: clmmTokenAccountType): Promise<(AccountMeta | AccountSignerMeta)[]> {
  const accounts: (AccountMeta | AccountSignerMeta)[] = []
  const addressEncoder = getAddressEncoder()

  //0. swapper_account(signer, writable)
  const admin = await createKeyPairSignerFromBytes(
    new Uint8Array([
      10, 92, 27, 184, 114, 49, 64, 68, 52, 212, 240, 162, 153, 140, 141, 89, 87, 248, 49, 41, 56, 143, 73, 183, 89,
      195, 22, 183, 89, 59, 194, 35, 227, 129, 76, 82, 217, 163, 19, 224, 13, 216, 217, 51, 54, 111, 34, 248, 164, 178,
      79, 111, 66, 116, 188, 189, 132, 117, 72, 191, 89, 77, 133, 134,
    ]),
  )
  accounts.push({
    address: address(admin.address),
    // address: address(data.swapper_account),
    signer: admin,
    role: AccountRole.WRITABLE_SIGNER,
  })

  //1. spl_token_account (readonly)
  accounts.push({
    address: address('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    role: AccountRole.READONLY,
  })

  //2. amm_token_account(writable)
  const [amm_token_account_address] = await get_lexicographical_token_pda(
    address(data.token_a_mint_account),
    address(data.token_b_mint_account),
    address(process.env.AMM_PROGRAM_ADDRESS!),
  )
  accounts.push({
    address: address(amm_token_account_address),
    role: AccountRole.WRITABLE,
  })
  //3. amm_token_a_pool_account(writable)
  const [token_a_pool_account_address] = await getProgramDerivedAddress({
    programAddress: address(process.env.AMM_PROGRAM_ADDRESS!),
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

  //4. amm_token_b_pool_account(writable)
  const [token_b_pool_account_address] = await getProgramDerivedAddress({
    programAddress: address(process.env.AMM_PROGRAM_ADDRESS!),
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

  //5. swapper_token_a_account(writable)
  accounts.push({
    address: address(data.swapper_token_a_account),
    role: AccountRole.WRITABLE,
  })

  //6. swapper_token_b_account(writable)
  accounts.push({
    address: address(data.swapper_token_b_account),
    role: AccountRole.WRITABLE,
  })

  //7. token_a_mint_account(read only)
  accounts.push({
    address: address(data.token_a_mint_account),
    role: AccountRole.READONLY,
  })

  //8. token_b_mint_account(read only)
  accounts.push({
    address: address(data.token_b_mint_account),
    role: AccountRole.READONLY,
  })

  //9. amm_program_account (read only)
  accounts.push({
    address: address(process.env.AMM_PROGRAM_ADDRESS!),
    role: AccountRole.READONLY,
  })
  //10. bitmap_account_one (read only)
  const bitmap_index_one = Buffer.alloc(4);
  bitmap_index_one.writeInt32BE(Math.floor(decoded_token_data.current_tick / 10000));

  const [bitmap_account_one_pda] = await getProgramDerivedAddress({
    programAddress:address(process.env.AMM_PROGRAM_ADDRESS!),
    seeds:["bitmap", bitmap_index_one, addressEncoder.encode(amm_token_account_address) ]
  })

  accounts.push({
    address: bitmap_account_one_pda,
    role: AccountRole.READONLY
  })

  //11 bitmap_account_two (read only)
  const bitmap_index_two = Buffer.alloc(4);
  bitmap_index_two.writeInt32BE(Math.floor(decoded_token_data.current_tick / 10000) + 1);

  const [bitmap_account_two_pda] = await getProgramDerivedAddress({
    programAddress:address(process.env.AMM_PROGRAM_ADDRESS!),
    seeds:["bitmap", bitmap_index_two, addressEncoder.encode(amm_token_account_address) ]
  })

  accounts.push({
    address: bitmap_account_two_pda,
    role: AccountRole.READONLY
  })

  //12. tick_array_account_one (read only)  
  const direction = true;
  // if (data.token_a_mint_account < data.token_b_mint_account){
  //   if (data.token_in_mint === data.token_a_mint_account && data.token_out_mint === data.token_b_mint_account){
  //     direction = false;
  //   } 
  // }else{
  //   if (data.token_in_mint === data.token_b_mint_account && data.token_out_mint === data.token_a_mint_account){
  //     direction = false;
  //   }
  // }
  for (const i of Array.from({ length: 11 }, (_, index) => index)){
  
    const tick_array_index = Buffer.alloc(4);
    console.log("tick_array_index: number: ", i,"index", direction ? Math.floor(decoded_token_data.current_tick / 88) + i: Math.floor(decoded_token_data.current_tick / 88) - i );
  tick_array_index.writeInt32BE(direction ? Math.floor(decoded_token_data.current_tick / 88) + i: Math.floor(decoded_token_data.current_tick / 88) - i);

    const [tick_array_pda] = await getProgramDerivedAddress({
    programAddress:address(process.env.AMM_PROGRAM_ADDRESS!),
    seeds:[tick_array_index, addressEncoder.encode(amm_token_account_address) ]
    });
    accounts.push({address: tick_array_pda,role: AccountRole.READONLY });
  }
  return accounts
}
