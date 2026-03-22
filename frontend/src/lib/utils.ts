import { type ClassValue, clsx } from 'clsx'
// import base64 from 'bs64';
import {
  Address,
  Base64EncodedBytes,
  getAddressCodec,
  getAddressEncoder,
  getProgramDerivedAddress,
  getStructCodec,
  getU128Codec,
  getU32Codec,
  getU64Codec,
  ProgramDerivedAddressBump,
  ReadonlyUint8Array,
} from 'gill'
import { twMerge } from 'tailwind-merge'
import { clmmTokenAccountType } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ellipsify(str = '', len = 4, delimiter = '..') {
  const strLen = str?.length
  const limit = len * 2 + delimiter.length

  return strLen >= limit ? str.substring(0, len) + delimiter + str.substring(strLen - len, strLen) : str
}
const addressEncoder = getAddressEncoder()
export async function get_lexicographical_tokens_addresses(
  a: Address,
  b: Address,
  seeds: (string | ReadonlyUint8Array)[],
): Promise<(string | ReadonlyUint8Array)[]> {
  if (a.toString() > b.toString()) {
    seeds.push(addressEncoder.encode(b))
    seeds.push(addressEncoder.encode(a))
  } else {
    seeds.push(addressEncoder.encode(a))
    seeds.push(addressEncoder.encode(b))
  }
  return seeds
}
export async function get_lexicographical_token_pda(
  a: Address,
  b: Address,
  program_id: Address,
): Promise<readonly [Address<string>, ProgramDerivedAddressBump]> {
  if (a.toString() > b.toString()) {
    return await getProgramDerivedAddress({
      programAddress: program_id,
      seeds: [addressEncoder.encode(b), addressEncoder.encode(a)],
    })
  } else {
    return await getProgramDerivedAddress({
      programAddress: program_id,
      seeds: [addressEncoder.encode(a), addressEncoder.encode(b)],
    })
  }
}

export async function getLexicographicalMintPda(
  str: string,
  ammTokenAccount: Address,
  a: Address,
  b: Address,
  program_id: Address,
): Promise<readonly [Address<string>, ProgramDerivedAddressBump]> {
  if (a.toString() > b.toString()) {
    return await getProgramDerivedAddress({
      programAddress: program_id,
      seeds: [str, addressEncoder.encode(ammTokenAccount), addressEncoder.encode(b), addressEncoder.encode(a)],
    })
  } else {
    return await getProgramDerivedAddress({
      programAddress: program_id,
      seeds: [str, addressEncoder.encode(ammTokenAccount), addressEncoder.encode(a), addressEncoder.encode(b)],
    })
  }
}

export async function getLexicographicalLpTokenPda(
  ownerAddress: Address,
  ammTokenAccount: Address,
  a: Address,
  b: Address,
  program_id: Address,
): Promise<readonly [Address<string>, ProgramDerivedAddressBump]> {
  if (a.toString() > b.toString()) {
    return await getProgramDerivedAddress({
      programAddress: program_id,
      seeds: [
        addressEncoder.encode(ownerAddress),
        addressEncoder.encode(ammTokenAccount),
        addressEncoder.encode(b),
        addressEncoder.encode(a),
      ],
    })
  } else {
    return await getProgramDerivedAddress({
      programAddress: program_id,
      seeds: [
        addressEncoder.encode(ownerAddress),
        addressEncoder.encode(ammTokenAccount),
        addressEncoder.encode(a),
        addressEncoder.encode(b),
      ],
    })
  }
}

export function clmm_token_account_decoder(data: Base64EncodedBytes): clmmTokenAccountType {
  // const base64codec = getBase64Codec();

  const u8_data = Buffer.from(data, "base64");
  const decoder = getStructCodec([
    ['pool_authority', getAddressCodec()],
    ['token_a_mint', getAddressCodec()],
    ['token_b_mint', getAddressCodec()],
    ['token_a_pool', getAddressCodec()],
    ['token_b_pool', getAddressCodec()],
    ['sqrt_price_a_by_b', getU128Codec()],
    ['current_tick', getU32Codec()],
    ['active_liquidity', getU128Codec()],
    ['fee_growth', getU128Codec()],
    ['protocol_fee', getU64Codec()],
  ])

  return decoder.decode(u8_data.subarray(1, u8_data.length));
}

export function price_to_tick_index(price: bigint): number {
  return Math.log(Number(price)) / Math.log(1.0001)
}

// export async function