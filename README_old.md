# 🌊 Concentrated Liquidity Market Maker (CLMM) on Solana

A high-performance, gas-efficient Concentrated Liquidity Market Maker (CLMM) implemented on the Solana blockchain. This protocol allows liquidity providers (LPs) to allocate capital within specific price ranges, maximizing capital efficiency compared to traditional AMMs.

## 🚀 Key Features

*   **Concentrated Liquidity**: LPs can provide liquidity in specific price ranges, earning more fees with less capital.
*   **MPL Core Integration**: Utilizes Metaplex Core (MPL Core) for efficient handling of Liquidity Provider (LP) positions as NFTs.
*   **Bitmap Optimization**: Implements a sophisticated bitmap index system for O(1) complexity in finding initialized ticks during swaps.
*   **Tick-Based Architecture**: precise price tracking using a tick system where $Price = 1.0001^{tick}$.

---

## 🏗️ Architecture & Account Structure

The protocol uses a set of specialized accounts to manage state, liquidity, and positions.

### 1. Global AMM State (`AMMAccount`)
The heart of the pool, storing global configurations and current state.
*   **File**: `state.rs`
*   **Data**:
    *   `pool_authority`: The program or authority managing the pool.
    *   `token_a_mint`, `token_b_mint`: Mints of the trading pair.
    *   `token_a_pool`, `token_b_pool`: Vaults holding the locked tokens.
    *   `sqrt_price_a_by_b`: Current square root price (Q64.64 format).
    *   `current_tick`: The tick index corresponding to the current price.
    *   `active_liquidity`: Liquidity currently active at the current price tick.
    *   `fee_growth`: Accumulator for fees.

### 2. Position Management (`PositionAccount`)
Represents a specific liquidity position held by a user.
*   **File**: `state.rs`
*   **Role**: Tracks the liquidity provided by a specific user within a specific range.
*   **Data**:
    *   `start_tick`, `end_tick`: The price range of the position.
    *   `liquidity`: Amount of liquidity provided.
*   **Note**: This account is associated with an **MPL Core NFT**, allowing positions to be transferred and managed as standard digital assets.

### 3. Tick Management (`TickState` & `TickArray`)
Stores information about specific ticks (prices) where liquidity changes.
*   **File**: `tick_state.rs`
*   **TickState**: Stores `net_liquidity` change at a specific tick.
*   **TickArray**: A collection of `TickState`s handled in batches (Conceptually similar to pages of ticks) to optimize account loading.

### 4. Swap Optimization (`Bitmap`)
A specialized index to quickly find the next initialized tick.
*   **File**: `bitmap/bitmapstate.rs`
*   **Mechanism**: A `u8` array (bitmap) where each bit serves as a flag for a tick's initialization status.
*   **Benefit**: changing the search for the next active tick from a linear scan (O(N)) to a bitwise operation, significantly reducing compute units (CU) during swaps.

---

## 🛠️ Instructions And Functions

The program exposes the following instructions for interacting with the CLMM.

### 1. `InitializeTokenPool`
Initializes a new CLMM pool for a pair of tokens.
*   **Purpose**: Sets up the global `AMMAccount`, initial price, and tick range.
*   **Inputs**:
    *   `token_a_amount`, `token_b_amount`: Initial amounts to determine starting price.
    *   `start_tick`, `end_tick`: Initial tick range for the first position.

### 2. `AddLiquidity`
Allows LPs to deposit tokens into a specific price range.
*   **Purpose**: Mints a position (represented by an MPL Core NFT) and updates the tick arrays and bitmap.
*   **Inputs**:
    *   `liquidity`: Amount of liquidity to add.
    *   `start_tick`, `end_tick`: The price range boundaries.
*   **Logic**:
    *   Calculates required Token A and Token B based on the current price and range.
    *   Updates `PositionAccount` and `TickArray`s.
    *   Updates `Bitmap` to mark ticks as initialized.

### 3. `WithdrawLiquidity`
Removes liquidity from a position.
*   **Purpose**: Burns liquidity and returns tokens to the user.
*   **Inputs**:
    *   `minimum_liquidity`: Slippage protection.
*   **Logic**:
    *   Calculates token amounts due based on the position's share of the pool.
    *   Updates `PositionAccount` and `TickArray`s.
    *   If a tick has zero net liquidity after withdrawal, it updates the `Bitmap` to unmark the tick.

### 4. `Swap`
Executes a trade against the pool.
*   **Purpose**: Swaps Token A for Token B (or vice versa).
*   **Inputs**:
    *   `amount_in`: Amount of input token.
    *   `minimum_amount_out`: Slippage protection.
    *   `mint_address_in`, `mint_address_out`: Direction of the swap.
*   **Logic (The Engine)**:
    1.  **Bitmap Search**: Uses the `Bitmap` account to efficiently find the next initialized tick in the swap direction.
    2.  **Step-wise Swap**: Swaps tokens within the current tick range until the price crosses a tick or the input amount is exhausted.
    3.  **Tick Crossing**: If the price crosses a tick, the `active_liquidity` is updated based on the `net_liquidity` stored in that tick.
    4.  Repeats until the swap is fully executed.

---

## 🧩 Technical Deep Dives

### MPL Core Integration
Instead of using standard SPL Token definitions for LP tokens, this project leverages **Metaplex Core**.
*   **Why?**: MPL Core provides a lightweight, flexible standard for NFTs. Each LP position is a unique NFT.
*   **Usage**: When a user adds liquidity, an MPL Core asset is minted. This asset acts as the "key" to the `PositionAccount`. Ownership of the NFT grants authority to modify or withdraw the position.

### Bitmap Optimization (`contract/src/bitmap`)
The most computation-heavy part of a CLMM is finding the "next tick" during a swap. If ticks are sparse, iterating through them one by one consumes excessive gas.
*   **Solution**: We map ticks to bits in a `Bitmap` account.
    *   `1` = Tick is initialized (has liquidity).
    *   `0` = Tick is empty.
*   **Algorithm**:
    *   To find the next tick, we don't loop. We load the bitmap byte corresponding to the current tick.
    *   We use bitwise operations (like CLZ/CTZ - Count Leading/Trailing Zeros) to instantly find the offset to the next `1` bit.
    *   This allows the swap instruction to skip over thousands of empty ticks in a single CPU instruction.

---

## 📂 Project Structure

```
contract/src
├── lib.rs              # Entry point registration
├── entrypoint.rs       # Program entrypoint & instruction dispatch
├── instruction.rs      # Instruction definitions & serialization
├── processor.rs        # Core business logic (The "Brain")
├── state.rs            # Account definitions (AMMAccount, PositionAccount)
├── tick_state.rs       # Tick & TickArray definitions
├── formulas.rs         # Math helpers (Price <-> Tick conversions)
├── error.rs            # Custom program errors
├── bitmap/             # Bitmap optimization module
│   ├── mod.rs
│   ├── bitmapstate.rs  # Bitmap account structure
│   └── bitmaphelper.rs # Bitwise logic helpers
└── delta/              # Token delta calculations
```

## 📦 Dependencies

The project is built using the raw `solana-program` library for maximum control and efficiency. Key dependencies include:

*   **`solana-program` (v3.0.0)**: The core library for writing Solana programs.
*   **`mpl-core` (v0.11.1)**: Metaplex Core library for managing NFT-based positions.
*   **`spl-token-interface` (v2.0.0)**: Interface for interacting with SPL Token programs.
*   **`solana-system-interface` (v3.0.0)**: Interface for interacting with the System Program.
*   **`borsh` (v1.5.7)**: Serialization/deserialization framework for account data.
*   **`num-traits` & `num-derive`**: Numeric traits for mathematical operations.