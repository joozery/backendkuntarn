const { query } = require('./db/db');

async function run() {
    try {
        console.log('--- Updating contract date for F5679 to 2025-11-29 ---');

        const result = await query(`
            UPDATE installments
            SET contract_date = '2025-11-29 00:00:00',
                start_date = '2025-11-29 00:00:00'
            WHERE contract_number = 'F5679'
        `);

        console.log('Updated rows:', result.affectedRows);

        // Update payment date as well
        console.log('\n--- Updating down payment date to match ---');
        const paymentResult = await query(`
            UPDATE payments p
            JOIN installments i ON p.installment_id = i.id
            SET p.payment_date = '2025-11-29 00:00:00'
            WHERE i.contract_number = 'F5679'
            AND p.notes LIKE '%เงินดาวน์%'
        `);

        console.log('Updated payment rows:', paymentResult.affectedRows);

        // Verify
        console.log('\n--- Verification ---');
        const verify = await query(`
            SELECT contract_number, contract_date, start_date
            FROM installments
            WHERE contract_number = 'F5679'
        `);
        console.table(verify);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
