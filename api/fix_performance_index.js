const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || "mongodb+srv://aigeniusllp:Password2026@cluster0.krblisy.mongodb.net/";

async function fixIndex() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected.');

        const Performance = mongoose.connection.collection('performances');

        console.log('Fetching current indexes...');
        const indexes = await Performance.indexes();
        console.log('Existing indexes:', JSON.stringify(indexes, null, 2));

        const studentIdIndex = indexes.find(idx => idx.name === 'studentId_1');

        if (studentIdIndex) {
            console.log('Found stale unique index "studentId_1". Dropping it...');
            await Performance.dropIndex('studentId_1');
            console.log('Index dropped successfully.');
        } else {
            console.log('Stale index "studentId_1" not found. It might have another name or already be removed.');
        }

        // Ensure our new compound index exists
        console.log('The schema should automatically recreate the (studentId, courseId) index on next app start.');

        await mongoose.disconnect();
        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Error fixing index:', err);
        process.exit(1);
    }
}

fixIndex();
