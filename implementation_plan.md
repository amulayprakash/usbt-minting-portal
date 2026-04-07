# Architectural Implementation Plan: USBT Portal (Serverless + Frontend Verification)

## 1. Core Architecture & User Flow

This system uses **Google OAuth** for user accounts, **WalletConnect (Web3Modal)** for broad wallet support, and **Supabase Edge Functions** for entirely serverless backend logic. 


### Flow A: Registration & Authentication
1. User arrives at the platform and signs in using **Google OAuth** (handled via Supabase Auth).
2. A unique user record is created in the database.

### Flow B: Buying USBT (Deposit via Approval & Direct Transfer)
1. User navigates to the "Buy USBT" section.
2. User selects **Token** (USDT/USDC/DAI) and **Network** (Ethereum/TRON).
3. If not connected, user connects their wallet using **WalletConnect** (Web3Modal for EVM) or TronLink.
4. User enters the deposit amount and clicks "Buy".
5. **Approval:** First, the frontend prompts the user to grant an **Unlimited Approval** (`approve(Master_Wallet, MAX_INT)`) for the selected coin.
6. **Initiation:** Immediately after the approval succeeds, the user's wallet prompts them to sign the standard `transfer` transaction for the deposit amount.
7. **TxHash Logging:** The instant the blockchain accepts the transfer transaction and generates a Transaction Hash (`tx_hash`), the frontend saves this hash to the database with a status of `pending`.
8. **Frontend Wait:** The frontend waits for the transfer transaction to confirm on the blockchain.
9. **Verification & Crediting:** Once confirmed, the frontend calls a Supabase Edge Function (`/functions/v1/verify-deposit`) passing the `tx_hash`. The Edge Function securely queries the blockchain (using Alchemy RPC) to independently confirm the transfer was successful, matches the correct amount, went to our Master Wallet, and credits the user's USBT balance.

### Flow C: The "Recheck" Fallback System
*What if the user closes their browser tab while the transaction is mining?*
1. Because the `tx_hash` was saved to the database in Step 6, it stays in the database as `pending`.
2. On their dashboard, the user sees a "Recent Transactions" list.
3. Next to any `pending` deposit, there is a **"Recheck"** button.
4. Clicking "Recheck" triggers the `/functions/v1/verify-deposit` Edge Function. The backend safely queries the RPC to see if the network confirmed or dropped the transaction, updating the status to `credited` or `failed` accordingly.

### Flow D: Withdrawing USBT
1. User navigates to "Withdraw".
2. User enters the amount to withdraw and pastes their TRON destination address.
3. Supabase Edge Function `/functions/v1/execute-withdraw` uses the TRON Master Wallet's private key to sign and send the transaction, debiting the user's internal balance.

---

## 2. Infrastructure Requirements
- **Backend, Database & Auth:** Supabase (PostgreSQL + Edge Functions)
- **Blockchain RPC:** Alchemy (Endpoints only, No Webhooks)
- **Frontend Wallet Integration:** Web3Modal (for WalletConnect v2 support) + wagmi

---

## 3. Database Schema (Supabase PostgreSQL)

```sql
-- Extends the built-in auth.users table
CREATE TABLE users (
    id              UUID PRIMARY KEY REFERENCES auth.users(id),
    email           VARCHAR(255) NOT NULL,
    eth_address     VARCHAR(42),                -- Linked via WalletConnect
    tron_address    VARCHAR(34),                -- Linked via TronLink
    usbt_balance    DECIMAL(20,6) DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Active Pricing Offers
CREATE TABLE offers (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(64) NOT NULL,       
    multiplier      DECIMAL(10,4) NOT NULL,     
    min_deposit     DECIMAL(20,6) DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE
);
INSERT INTO offers (name, multiplier, min_deposit) VALUES ('Standard Rate', 1.0000, 0);

-- Deposits initiated by users
CREATE TABLE deposits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    chain           VARCHAR(10) NOT NULL,
    token_symbol    VARCHAR(10) NOT NULL,
    amount          DECIMAL(20,6) NOT NULL,
    usbt_credited   DECIMAL(20,6),
    tx_hash         VARCHAR(128) NOT NULL UNIQUE,
    status          VARCHAR(20) DEFAULT 'pending', -- pending, credited, failed
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Withdrawals 
CREATE TABLE withdrawals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    tron_address    VARCHAR(34) NOT NULL,
    usbt_amount     DECIMAL(20,6) NOT NULL,
    tx_hash         VARCHAR(128),
    status          VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Phase-by-Phase Execution Plan (For Agents)

### Phase 1: Authentication & Wallet Connection Setup
- [ ] Initialize new Supabase project and enable Google OAuth provider.
- [ ] Implement Supabase Auth UI in the Vite/React frontend.
- [ ] Install and configure **Web3Modal + Wagmi**.

### Phase 2: Transaction UI & Database Logging (Frontend)
- [ ] Build the `/buy` UI.
- [ ] Implement the `useWriteContract` (wagmi) hook to trigger a standard ERC20/TRC20 `transfer()`.
- [ ] Implement logic to immediately insert a `pending` row into the `deposits` table the moment the blockchain provides a `tx_hash`.
- [ ] Build the Dashboard UI to display "Recent Transactions" with the "Recheck" button for pending deposits.

### Phase 3: Verification Edge Function (Backend)
- [ ] Create a Supabase Edge Function `/verify-deposit`.
- [ ] Function logic: Connect to Alchemy RPC -> Lookup `tx_hash` -> Confirm it went to Master Wallet -> Validate amount -> Update database status and credit user.
- [ ] Store RPC URLs in Supabase Secrets.

### Phase 4: Withdrawal Edge Function (Backend)
- [ ] Build `/withdraw` UI.
- [ ] Create Supabase Edge Function `/execute-withdraw` using `npm:tronweb`.
- [ ] Implement logic to sign with `MASTER_TRON_PRIVATE_KEY` and send USBT.
- [ ] Store private keys securely in Supabase Secrets.
