require('dotenv').config();
const { supabase } = require('../config/supabase');

async function addOTPColumns() {
    try {
        console.log('Adding OTP columns to users table...');

        // Add the new columns using raw SQL
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: `
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS reset_otp VARCHAR(6),
        ADD COLUMN IF NOT EXISTS reset_otp_expires TIMESTAMP,
        ADD COLUMN IF NOT EXISTS reset_otp_attempts INTEGER DEFAULT 0;
        
        CREATE INDEX IF NOT EXISTS idx_users_reset_otp ON users(reset_otp) WHERE reset_otp IS NOT NULL;
      `
        });

        if (error) {
            console.error('Error adding OTP columns:', error);

            // Try alternative approach - direct SQL execution
            console.log('Trying alternative approach...');

            const queries = [
                'ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp VARCHAR(6)',
                'ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp_expires TIMESTAMP',
                'ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp_attempts INTEGER DEFAULT 0'
            ];

            for (const query of queries) {
                try {
                    const { error: queryError } = await supabase.rpc('exec_sql', { sql: query });
                    if (queryError) {
                        console.log(`Query "${query}" result:`, queryError.message);
                    } else {
                        console.log(`✅ Successfully executed: ${query}`);
                    }
                } catch (err) {
                    console.log(`Query "${query}" error:`, err.message);
                }
            }
        } else {
            console.log('✅ Successfully added OTP columns');
        }

    } catch (error) {
        console.error('Script error:', error);

        // Manual approach - check if we can at least verify the table structure
        console.log('Checking current table structure...');
        try {
            const { data: tableInfo, error: tableError } = await supabase
                .from('users')
                .select('*')
                .limit(1);

            if (tableError) {
                console.error('Table check error:', tableError);
            } else {
                console.log('✅ Users table is accessible');
                console.log('Note: You may need to add the OTP columns manually in Supabase dashboard:');
                console.log('- reset_otp (VARCHAR(6))');
                console.log('- reset_otp_expires (TIMESTAMP)');
                console.log('- reset_otp_attempts (INTEGER, default 0)');
            }
        } catch (err) {
            console.error('Table verification error:', err);
        }
    }
}

// Run the script
addOTPColumns().then(() => {
    console.log('Script completed');
    process.exit(0);
}).catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
});