# CLMM — Concentrated Liquidity Market Maker

> A fully custom, end-to-end Concentrated Liquidity Market Maker (AMM) protocol built from scratch on **Solana**, featuring a Concentrated Liquidity (CLMM) engine, a real-time transaction indexer, and a modern Next.js trading interface.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            CLMM Ecosystem                                    │
│                                                                              │
│  ┌────────────────┐    Transactions   ┌──────────────────────────────────┐   │
│  │  Solana Chain  │ ─────────────────>│         Indexer (Rust)           │   │
│  │  CLMM Contract │                   │  WebSocket Listener + Postgres   │   │
│  │  (on-chain)    │ <──── CPI ────────│  HTTP API Server (Axum)          │   │
│  └────────────────┘                   └───────────────┬──────────────────┘   │
│                                                       │ REST API             │
│                                        ┌──────────────▼───────────────────┐  │
│                                        │         Frontend (Next.js)       │  │
│                                        │  Pool Explorer · Swap · Liquidity│  │
│                                        │  Add/Withdraw · Position Mgmt.   │  │
│                                        └──────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Technical Highlights

### On-Chain Contract

- **Tick Array Management**: Liquidity is tracked across the price curve using fixed-size tick arrays, each holding 88 consecutive ticks. Each entry stores the net liquidity delta (`i64`), updated whenever a position's boundary is added or removed. During a swap, the engine traverses these arrays to determine how much liquidity changes as the price crosses each tick boundary.

- **Bitmap for Active Tick Tracking**: A separate u8-packed bitmap account covers ranges of 10,000 ticks and tracks *which* ticks are active (i.e., have liquidity positions at their boundaries). During swaps, the bitmap is scanned to quickly locate the next active tick without iterating every possible tick — significantly reducing compute unit (CU) consumption. `bytemuck::cast_slice` is used for zero-copy access, avoiding any deserialization overhead.

- **`bytemuck` for Zero-Copy Bitmap Access**: The tick array raw byte data is reinterpreted directly as a `&[i64]` slice using `bytemuck::cast_slice`. This avoids any Borsh deserialization pass over the tick array during swaps, keeping CU costs low and making hot-path code allocation-free.

- **Q64.64 Fixed-Point Price Storage**: Floating-point numbers are not supported on-chain. All prices and liquidity values are stored as `u128` integers in the **Q64.64 fixed-point format**: `stored_value = sqrt(price) × 2^64`. This preserves precision while enabling integer-only arithmetic on-chain. Conversion back to human-readable floats happens off-chain (indexer and frontend).

- **NFT-Backed Transferable Position Accounts**: Each liquidity position is backed by an NFT minted via the **Metaplex Core** program. The position PDA (`PositionAccount`) is derived from `[nft_mint, token_a_mint, token_b_mint]`. Since the NFT is transferable between wallets, the actual ownership of a concentrated liquidity position can be transferred from one user to another simply by transferring the NFT, enabling a secondary market for positions.

- **Custom Error Derivation via `spl_program_error` Macro**: All on-chain error variants are defined using the `#[spl_program_error]` proc-macro attribute, which generates deterministic error codes from a fixed hash base. This eliminates manual `impl From<AMMError> for ProgramError` boilerplate and produces self-documenting error messages in transaction logs.

- **Reading the Official CPI Interface Without Anchor**: The account indexes, instruction data layouts, and signer requirements for SPL Token (`transfer`, `initialize_account`) and Metaplex Core (`create_asset`) were derived by reading the official program source code and documentation directly — not through Anchor IDL abstractions. This required understanding raw `CompiledInstruction` account index arrays and manually constructing each `AccountMeta`.

### Indexer

- **WebSocket Event Listener + Base58 Signature Pipeline**: The indexer subscribes to the Solana WebSocket `logsSubscribe` endpoint using `PubsubClient`, filtered to only events mentioning the CLMM program ID. Each notification yields a Base58-encoded transaction signature. These signatures are sent through a `tokio::mpsc` channel into the async processing pipeline.

- **Base58 → Full Transaction → Base64 Account Data Parsing**: Received signatures (Base58 strings) are passed to `getTransaction` with `UiTransactionEncoding::Base58` to fetch the full versioned transaction. The embedded instruction data bytes are then Borsh-deserialized back into `CLMMInstruction` enum variants. Separately, account state is fetched via `getMultipleAccounts` with `UiAccountEncoding::Base64` and decoded through the same account structs as the on-chain program.

- **`tokio::mpsc` Message Passing Pipeline**: A multi-producer, single-consumer channel decouples the blocking WebSocket thread (running in `spawn_blocking`) from the async Tokio runtime. Signatures flow through the channel into per-transaction `spawn` tasks, which independently fetch and process each transaction without blocking the receiver loop.

- **`sqlx` Compile-Time Query Safety**: All database queries use the `sqlx::query!` and `sqlx::query_as!` macros, which are verified against the live database schema *at compile time*. This means schema mismatches are caught as build errors, not runtime panics.

---

## On-Chain Contract (`/contract`)

The smart contract is a **native Solana program** written entirely in Rust — no Anchor framework. It implements the full Concentrated Liquidity Market Maker protocol.

### Core Instructions

| Instruction | Description |
|---|---|
| `InitializeTokenPool` | Creates the AMM pool, NFT position, token pool PDAs, tick arrays, and bitmap accounts. Validates initial price is within the provided tick range. |
| `AddLiquidity` | Accepts liquidity from a provider for a given price range (tick range). Mints an NFT to represent the position. Calculates and transfers the precise amounts of Token A and Token B required. |
| `WithdrawLiquidity` | Burns liquidity from a position. Calculates token amounts based on current price and range. Returns tokens to the provider. Optionally closes the position account and reclaims rent. |
| `Swap` | Executes a token swap by traversing active tick boundaries in the bitmap. Iterates through tick arrays and adjusts liquidity and price dynamically as ticks are crossed. |

### On-Chain Account States

#### `AMMAccount` (Pool State — 221 bytes)
Stored at a PDA derived from the two token mints (lexicographically ordered):

| Field | Type | Description |
|---|---|---|
| `pool_authority` | `Pubkey` | AMM program ID |
| `token_a_mint` | `Pubkey` | Mint of Token A (lexicographically smaller) |
| `token_b_mint` | `Pubkey` | Mint of Token B |
| `token_a_pool` | `Pubkey` | PDA holding Token A reserves |
| `token_b_pool` | `Pubkey` | PDA holding Token B reserves |
| `sqrt_price_a_by_b` | `u128` | Current price encoded as Q64.64 fixed-point sqrt |
| `current_tick` | `u32` | Current active tick index |
| `active_liquidity` | `u128` | Total liquidity active at the current tick (Q64.64) |
| `fee_growth` | `u128` | Cumulative fee growth |
| `protocol_fee` | `u64` | Accumulated protocol fees |

#### `PositionAccount` (25 bytes)
Stored at a PDA derived from `[nft_mint, token_a_mint, token_b_mint]`:

| Field | Type | Description |
|---|---|---|
| `start_tick` | `u32` | Lower bound tick of the liquidity range |
| `end_tick` | `u32` | Upper bound tick of the liquidity range |
| `liquidity` | `u128` | Liquidity held in this position (Q64.64) |

#### Tick Arrays & Bitmaps
- **TickArray**: Stores net liquidity delta (`i64`) for each of 88 consecutive ticks. Used during swap to update active liquidity when crossing a tick boundary.
- **Bitmap**: Each u8-packed bitmap covers a range of 10,000 ticks and tracks which specific ticks are "active" (have liquidity). Used for efficient tick traversal during swaps.

### Mathematical Formulas

All math is implemented from scratch in `formulas.rs` and `delta_helper.rs`:

- **Price ↔ Tick Conversion**: `price = 1.0001 ^ tick_index`
- **Q64.64 Fixed-Point Encoding**: `sqrt_price_stored = sqrt(price) × 2^64`
- **Token Amounts from Liquidity**:
  - `ΔA = L × (√P_upper − √P_lower)` (Token A delta)
  - `ΔB = L × (1/√P_lower − 1/√P_upper)` (Token B delta)
- The formulas correctly handle three cases depending on whether the current price is below, within, or above the position's range.

### PDA Derivation Strategy

The protocol uses a strict **lexicographic canonical ordering** of token mint addresses for all PDA seeds. This ensures a unique, deterministic PDA for every token pair, regardless of the order the user provides them.

- **Pool PDA**: `["pool", amm_token_account_pda, token_mint]`
- **Bitmap PDA**: `["bitmap", bitmap_index_be_bytes, amm_token_account_pda]`
- **Tick Array PDA**: `[tick_array_index_be_bytes, amm_token_account_pda]`
- **Position PDA**: `[nft_mint, token_a_mint, token_b_mint]`

### Error Handling

A comprehensive custom error enum (`AMMError`) covers:
`InvalidSigner`, `NotWritable`, `AccountAlreadyInitialized`, `AccountNotInitialized`, `InsufficientTokenBalance`, `InvalidMintAccount`, `InvalidAMMTokenAccount`, `InvalidPDA`, `InvalidPositionAccount`, `InitialPriceOutOfRange`, `InvalidBitmapArray`, `InvalidTickArray`, and more.

### Dependencies (Contract)
| Crate | Purpose |
|---|---|
| `solana-program` v3 | Core Solana on-chain SDK |
| `spl-token-interface` v2 | SPL Token account parsing & transfer CPIs |
| `borsh` v1.5 | Binary serialization for on-chain data |
| `spl-program-error` | Macro-based custom error codes |
| `bytemuck` | Zero-copy casting for tick array data |
| `solana-system-interface` | System program CPI (create accounts) |

---

## Indexer (`/indexer`)

The indexer is a standalone **async Rust service** that listens to the Solana blockchain in real time and maintains a queryable off-chain database of the protocol state.

### Transaction Processing Pipeline

```
  Solana Blockchain
        |
        |  New transaction detected (CLMM program)
        v
  WebSocket Listener
        |
        |  Transaction signature received
        v
  Sync-to-Async Bridge
        |
        |  Signature queued via message channel
        v
  Async Message Channel
        |
        |  One parallel worker spawned per transaction
        v
  Transaction Fetcher
        |
        |  Full transaction fetched and decoded
        v
  Instruction Parser
        |
        |  Instruction data extracted and identified
        v
        +----------------+----------------+
        |                |                |
   Pool Created    Liquidity Added/    Swap Executed
                   Withdrawn
        |                |                |
        +----------------+----------------+
        |
        |  Relevant accounts fetched at confirmed state
        v
  Account Deserializer
        |
        |  Pool state, position, token balances decoded
        v
  Database Writer
        |
        |  Records inserted, updated, or deleted
        v
  PostgreSQL
```

> - A sync-to-async bridge prevents the blocking listener thread from stalling the async runtime
> - The message channel decouples event receipt from processing and provides natural back-pressure
> - Each transaction is handled in its own isolated parallel worker
> - Accounts are fetched at the exact slot of the transaction to avoid stale data

### Key Features

- **Real-Time Event Processing**: Subscribes via WebSocket to all transactions mentioning the CLMM program address. Processes each transaction in parallel using `tokio::task::spawn`.
- **Automatic Reconnection**: The main loop wraps the WebSocket connection in a retry loop, automatically reconnecting on disconnection.
- **Slot-Anchored Account Fetching**: Uses `min_context_slot` when fetching account data via RPC to guarantee the indexer sees the state *after* the transaction, not before.
- **Database Schema Auto-Migration**: Runs `sqlx::migrate!()` on startup.
- **Instruction Dispatching**: Each transaction is decoded using Borsh deserialization (mirroring the on-chain instruction enum). Instructions are filtered by the CLMM program ID before processing.

### Database Tables

| Table | Description |
|---|---|
| `markets` | One row per AMM pool: mints, current price/tick, active liquidity, fee growth, pool PDAs |
| `position_accounts` | One row per open position: user, NFT address, tick range, liquidity, position PDA |
| `token_pool` | Token balances per pool for Token A and Token B |
| `user_token_accounts` | User wallet's SPL token account addresses and balances |
| `active_ticks` | Active tick bitmap entries per market with net liquidity |
| `users` | User registry keyed by wallet address |

### Instruction Handlers

| Handler | Accounts Fetched | DB Operations |
|---|---|---|
| `handle_initialize_token_pool` | AMM Account, Token Pool A/B, Position, User Token A/B, Tick Arrays | INSERT `markets`, `token_pool`, `position_accounts`, `user_token_accounts`, `active_ticks` |
| `handle_add_liquidity` | Position, Tick Arrays, User Token A/B | INSERT/UPDATE `position_accounts`, `active_ticks`, `user_token_accounts` |
| `handle_withdraw_liquidity` | Position (may be deleted), Tick Arrays, User Token A/B | UPDATE or DELETE `position_accounts`, UPDATE `active_ticks`, UPDATE `user_token_accounts` |
| `handle_swap` | AMM Account, User Token A/B | UPDATE `markets` (price/tick/liquidity), UPDATE `user_token_accounts` |

### HTTP API (Axum)

The indexer also serves an HTTP API (scaffolded with Axum) for direct data access by the frontend.

### Dependencies (Indexer)
| Crate | Purpose |
|---|---|
| `tokio` | Async runtime with `mpsc` channels and task spawning |
| `solana-client` | RPC + WebSocket PubsubClient |
| `sqlx` | Async PostgreSQL driver with compile-time query checking |
| `axum` | HTTP API framework |
| `borsh` | Borsh deserialization mirroring the contract |
| `anyhow` | Ergonomic error handling |
| `bytemuck` | Zero-copy casting for tick array deserialization |
| `spl-token-interface` | SPL token account deserialization |
| `clap` | CLI configuration parsing |
| `dotenvy` | `.env` file loading |
| `uuid` | UUID generation for database primary keys |

---

## Frontend (`/frontend`)

A high-fidelity, production-quality trading interface built with **Next.js 15** and the **App Router**.

### Pages & Routes

| Route | Description |
|---|---|
| `/` | Market listing page — pool explorer with pagination, search, and sorting |
| `/pool/[id]` | Individual pool detail page with price chart, density chart, swap, and liquidity management |
| `/account` | User account page |
| `/admin` | Admin panel |

### API Routes (Next.js Server)

| Route | Method | Description |
|---|---|---|
| `GET /api/markets` | GET | Paginated, filtered, sorted market listing with optional `token_pool` JOIN |
| `GET /api/markets/[id]` | GET | Single market detail by ID |
| `GET /api/user/positions` | GET | All positions for a wallet address in a given market |
| `GET /api/user/token-accounts` | GET | All SPL token accounts for a wallet address |

All API routes connect to the same **PostgreSQL** database as the indexer.

**Data Parsing**: Raw Q64.64 values stored as `TEXT` by the indexer are decoded back to human-readable floats in the API layer using a custom `parseU128` function: `value = (raw / 2^64)^2`.

### Server Actions

**`withdrawLiquidity.ts`** (Server Action): Constructs and submits the on-chain `WithdrawLiquidity` instruction. It:
1. Fetches and deserializes the on-chain position account using the `gill` RPC client.
2. Derives all required PDAs (pool, token pools, tick arrays, bitmaps) from the position data.
3. Serializes the instruction using Borsh codec.
4. Constructs a legacy transaction, simulates it, and submits it.
5. Subscribes to account and log notifications to track confirmation.

**`addLiquidity.ts`** (Server Action): Same pattern for `AddLiquidity` instruction. Derives NFT signer, position PDA, tick array accounts, and bitmap accounts on-the-fly.

### State Management & Data Flow
- **Wallet**: `@wallet-ui/react` provides wallet connection state. `useWalletUi()` hook exposes the connected account address.
- **Fetching**: `useEffect` + `fetch` calls to Next.js API routes for server-side data. No external state management library.
- **Transaction Encoding**: `gill` library handles all Solana transaction primitives: `createTransactionMessage`, `setTransactionMessageFeePayer`, `getBase64EncodedWireTransaction`, `sendAndConfirmTransactionFactory`.

### Tech Stack (Frontend)
| Technology | Version / Notes |
|---|---|
| Next.js | 15 (App Router, Server Actions) |
| TypeScript | Strict mode |
| React | 19 |
| `gill` | Solana web3 library for tx construction |
| `@wallet-ui/react` | Solana wallet adapter |
| `borsh` | Client-side Borsh codec |
| `pg` (node-postgres) | Direct PostgreSQL connection |
| `@mui/icons-material` | Icon library |
| Vanilla CSS + CSS Variables | Theming with dark mode support |

---
<!-- 
## 🛠️ Skills Demonstrated

Building this project required deep, hands-on expertise across a wide range of disciplines:

### Solana / Blockchain

| Skill | Details |
|---|---|
| **Native Solana Program Development** | Writing on-chain programs without Anchor — manually handling account deserialization, PDA derivation, CPI invocations, and signer seeds |
| **CLMM Algorithm Implementation** | From-scratch implementation of the Concentrated Liquidity Market Maker model (à la Uniswap v3) — tick math, bitmap traversal, delta calculations |
| **Q64.64 Fixed-Point Arithmetic** | Encoding and decoding `sqrt(price) × 2^64` as `u128` for integer-safe price representation on-chain |
| **Borsh Serialization** | Defining, encoding, and decoding on-chain account state and instruction data using Borsh |
| **SPL Token CPI** | Invoking SPL Token program instructions (`transfer`, `initialize_account`) from the on-chain program |
| **PDA Derivation** | Deterministic, canonical PDA derivation for pools, positions, tick arrays, and bitmaps |
| **Metaplex Core NFT Integration** | Minting NFTs using the `mpl-core` program to represent liquidity positions |
| **Account Validation Patterns** | Verifying signers, writability, ownership, initialization states, and mint matching for all instruction accounts |
| **Tick Array Management** | 88-tick arrays with `bytemuck` zero-copy `i64` slices for net liquidity updates |
| **Bitmap Indexing** | u8-packed bitmaps for efficient active-tick discovery during swap routing |
| **Swap Routing** | Multi-tick swap traversal — crossing tick boundaries, adjusting active liquidity, and computing output amounts |
| **Rent Reclamation** | Zeroing out account data and transferring lamports back to the user on full position close |

### Rust

| Skill | Details |
|---|---|
| **Async Rust / Tokio** | Multi-task async architecture with `tokio::spawn`, `mpsc` channels, and `spawn_blocking` for WebSocket/async bridging |
| **Error Handling** | `anyhow` for propagatable errors; custom `spl_program_error` enum for on-chain errors |
| **Trait Implementation** | Implementing `Pack`, `IsInitialized`, `Sealed`, `BorshSerialize`, `BorshDeserialize` for custom state types |
| **Pattern Matching** | Exhaustive enum matching on `AMMAccount`, `PositionAccount`, `VersionedMessage`, `CLMMInstruction` |
| **Borrow Checker Mastery** | Managing `RefCell` borrows for on-chain account data; `drop()` coordination in swap tick traversal loops |

### Database

| Skill | Details |
|---|---|
| **sqlx** | Async PostgreSQL with `query!`, `query_as!` macros for compile-time safe queries |
| **Schema Design** | Relational schema for markets, positions, tick state, users, and token accounts |
| **Migrations** | Auto-running migrations on startup with `sqlx::migrate!()` |
| **Conditional JOINs** | Dynamic SQL construction with optional `LEFT JOIN` based on schema introspection |

### Web / Frontend

| Skill | Details |
|---|---|
| **Next.js App Router** | Server Components, Client Components, API Routes, and Server Actions all used correctly |
| **Solana Transaction Building** | Constructing legacy and v0 transactions with `gill`, serializing instructions with Borsh codecs, simulating before sending |
| **Canvas-Based Data Visualization** | Custom interactive liquidity density chart on HTML `<canvas>` with zoom, pan, and dynamic tick label rendering |
| **Fixed-Point Decoding** | Decoding Q64.64 `u128` values from PostgreSQL `TEXT` columns back to floats for display |
| **Custom React Hooks & Effects** | Complex multi-dependency `useEffect` chains for synchronized UI state |
| **Wallet Integration** | Connecting Solana wallets, reading the active address, and co-signing transactions |
| **REST API Design** | Parameterized, paginated, sorted, and filtered API endpoints |

--- -->

## 📦 Database Schema (Summary)

```sql
markets (id UUID, mint_address_a, mint_address_b, current_price TEXT, current_tick TEXT,
         fees TEXT, active_liquidity TEXT, pool_address_a, pool_address_b, market_address)

position_accounts (id UUID, user_address, nft_address, start_tick TEXT, end_tick TEXT,
                   liquidity TEXT, position_address, market_id UUID → markets)

token_pool (id UUID, market_id UUID → markets, token_mint_address, pool_address, token_amount TEXT)

user_token_accounts (id UUID, user_address, token_mint_address, token_address, balance TEXT)

active_ticks (id UUID, market_id UUID → markets, tick_position INT, net_liquidity TEXT)

users (id TEXT PRIMARY KEY, username TEXT)
```

---

<!-- ## 🚀 Running the Project

### Prerequisites
- Rust toolchain (`rustup` + `cargo`)
- Node.js 20+ and `npm`
- PostgreSQL database
- Solana CLI tools
- A `.env` file in `/indexer` and `/frontend`

### Contract
```bash
# Build the contract
cd contract
cargo build-bpf

# Deploy to devnet
solana program deploy target/deploy/concentrated_liquidity_market_maker.so --url devnet
```

### Indexer
```bash
cd indexer
# Configure .env with DATABASE_URL and RPC_URL
cargo run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:3000
```

---

## 📌 Program ID

```
DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu
```

> Deployed on **Solana Devnet**

---

*This README was auto-generated from a full codebase analysis. For the original README, see [`README.md`](./README.md).* -->
