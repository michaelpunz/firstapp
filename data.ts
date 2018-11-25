import crypto from 'crypto';
import mongoose from 'mongoose';
import { deleteData, createData } from './test/fixture/mongodb';

require('dotenv').config({ path: '.env' });

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI, { useMongoClient: true });

// Run the proper function
if (process.argv.includes('--delete')) {
  deleteData().then(() => {
    console.log('Dati cancellati 💩');
    process.exit();
  });
} else {
  const multipliedIdx = process.argv.indexOf('--multiplier');
  const multiplier = multipliedIdx !== -1 ? Number(process.argv[multipliedIdx + 1]) : undefined;

  createData(multiplier).then(() => {
    console.log('Dati creati 👨🏻‍🎨');
    process.exit();
  });
}
