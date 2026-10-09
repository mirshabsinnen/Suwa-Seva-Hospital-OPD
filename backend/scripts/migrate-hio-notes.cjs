// Idempotent index-only migration. Existing note documents/timestamps remain untouched.
require('dotenv').config({ quiet: true });
require('node:dns').setServers((process.env.DNS_SERVERS || '1.1.1.1,8.8.8.8').split(',').map(s => s.trim()).filter(Boolean));
const mongoose = require('mongoose');
const Note = require('../src/models/HIOReportNote');
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    await Note.init();
    const before = await Note.countDocuments();
    const indexes = await Note.collection.indexes();
    for (const index of indexes) {
      if (index.unique && JSON.stringify(index.key) === JSON.stringify({ createdBy: 1, year: 1, month: 1 })) {
        await Note.collection.dropIndex(index.name);
        console.log('Removed obsolete one-note-per-month uniqueness index');
      }
    }
    await Note.collection.createIndex({ createdBy: 1, year: 1, month: 1 }, { name: 'hio_owner_month' });
    console.log(`Migration complete; ${before} existing notes preserved. No documents modified.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { await mongoose.disconnect(); }
})();
