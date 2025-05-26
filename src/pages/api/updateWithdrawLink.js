// lib/db/updateWithdrawLink.js
import { Pool } from 'pg';
 
const pool = new Pool({
  host: process.env.NEXT_PUBLIC_SPEND_LNBIT_DB_HOST,
  user:  process.env.NEXT_PUBLIC_SPEND_LNBIT_DB_USER,
  password:  process.env.NEXT_PUBLIC_SPEND_LNBIT_DB_PASSWORD,
  database:  process.env.NEXT_PUBLIC_SPEND_LNBIT_DB_NAME,
  port: 5432,
});

/**
 * Update rows in the withdraw.withdraw_link table by wallet value.
 * @param {string} wallet - Wallet value to match
 * @param {object} updates - Key-value pairs of columns to update
 * @returns {Promise<object>} - The updated row
 */
export async function updateWithdrawLinkByWallet(wallet, updates) {
  try {
    if (!wallet || typeof updates !== 'object' || !Object.keys(updates).length) {
      throw new Error('Invalid wallet or updates');
    }

    const setClauses = Object.keys(updates).map((key, i) => `${key} = $${i + 2}`);
    const values = [wallet, ...Object.values(updates)];

    const query = `
      UPDATE withdraw.withdraw_link
      SET ${setClauses.join(', ')}
      WHERE wallet = $1
      RETURNING *;
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      throw new Error('No matching wallet found');
    }

    return result.rows[0];
  } catch (error) {
    console.log("error updateWithdrawLinkByWallet-->", error)
  }
}
