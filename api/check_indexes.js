const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function checkIndexes() {
    try {
        await mongoose.connect(uri);
        const Performance = mongoose.connection.collection('performances');
        const indexes = await Performance.indexes();
        console.log('CURRENT INDEXES:');
        console.log(JSON.stringify(indexes, null, 2));
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkIndexes();
