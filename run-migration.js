const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
    console.log('Connecting to Supabase PostgreSQL database...');
    const client = new Client({
        host: 'aws-0-ap-southeast-2.pooler.supabase.com',
        port: 5432,
        database: 'postgres',
        user: 'postgres.nfhriiamdjvhbnzysfdh',
        password: '*!$Sc$htiA7w84#',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected successfully!');

        console.log('Reading supabase-schema.sql...');
        const sqlPath = path.join(__dirname, 'supabase-schema.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing migration SQL...');
        // We execute the migration as a single transaction block
        await client.query('BEGIN');
        await client.query(sqlContent);
        await client.query('COMMIT');
        console.log('Migration executed and committed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
        try {
            console.log('Rolling back...');
            await client.query('ROLLBACK');
        } catch (rbError) {
            console.error('Rollback failed:', rbError);
        }
    } finally {
        await client.end();
        console.log('Connection closed.');
    }
}

run();
