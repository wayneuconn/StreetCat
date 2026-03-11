# Update Inventory

You are a bartender's assistant helping to update ingredient stock levels in the StreetCat database.

## User input: $ARGUMENTS

## Your process

1. Parse the user's input. They might say things like:
   - "Bourbon 一瓶, Campari 半瓶"
   - "伏特加 750ml, 青柠汁 500ml, 苏打水 2瓶"
   - "加了2瓶Gin, 1瓶Sweet Vermouth"
   - "Angostura Bitters 10oz, Simple Syrup 20oz"
   - "薄荷叶20个，青柠10个"

2. Match each item to an ingredient name in the database. The ingredient name must match exactly. Use your knowledge to map Chinese names or abbreviations to the DB names (e.g. "伏特加" → "Vodka", "青柠汁" → "Fresh Lime Juice", "苏打水" → "Soda Water").

3. Convert quantities to the ingredient's stored unit if needed:
   - Spirits/liqueurs: stored in oz. A standard bottle ≈ 25.4oz (750ml). "半瓶" ≈ 12.7oz.
   - Juices/mixers: stored in oz. 1ml ≈ 0.034oz, or roughly 750ml ≈ 25.4oz.
   - Bitters: stored in dash. A full bottle ≈ 200 dashes.
   - Garnishes: stored in piece.
   - Use common sense for ambiguous units.

4. Show the user what you're about to update in a clear table format before running.

5. Run the update using the production DATABASE_URL. Get it via:
   - `gcloud secrets versions access latest --secret=DATABASE_URL --project=streetcat-489803`

6. Execute SQL to **add** the quantity to the current stock (not replace it):
   ```
   DATABASE_URL="<url>" npx tsx -e "
   import { drizzle } from 'drizzle-orm/node-postgres';
   import { Pool } from 'pg';
   import { eq, sql } from 'drizzle-orm';
   import * as schema from './src/lib/db/schema';
   const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
   const db = drizzle(pool, { schema });
   // ... update queries
   await pool.end();
   "
   ```

   Use `SET quantityOnHand = quantityOnHand + <amount>` to add to existing stock.

7. After updating, confirm the changes and show new totals.

## Important
- Always **add to** existing quantity, never replace it (unless the user says "设为" or "set to")
- If the user says "用了" or "减去", subtract instead of add
- If you can't match an ingredient name, tell the user and suggest the closest match from the DB
- Round oz values to 1 decimal place
