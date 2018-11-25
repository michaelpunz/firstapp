import { Express } from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongo from 'connect-mongo';
import mongoose from 'mongoose';
import passport from 'passport';
import expressValidator from 'express-validator';
import { logger } from '../logger';

import './auth';
import { cors } from './cors';

export function middlewares(app: Express) {
  // API keys and Passport configuration

  const MongoStore = mongo(session);

  // Connect to MongoDB
  mongoose.Promise = Promise;
  mongoose
    .connect(process.env.MONGOLAB_URI, { useMongoClient: true })
    .then(() => {
      /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
    })
    .catch(err => {
      console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
      process.exit();
    });

  // Express configuration
  app.set('port', process.env.PORT || 3001);
  app.use(
    morgan('dev', {
      stream: { write: message => logger.info(message.trim()) }
    })
  );

  // Simulate server delay
  // app.use((req, res, next) => setTimeout(next, 1000));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // To help validate forms
  app.use(expressValidator());

  // Saves session to MongoDB
  app.use(
    session({
      cookie: { maxAge: 7 * 24 * 3600 * 1000 }, // 1 week
      resave: true,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      store: new MongoStore({
        url: process.env.MONGOLAB_URI,
        autoReconnect: true
      })
    })
  );

  // Initializes authentication with Facebook, Google, email&password etc.
  app.use(passport.initialize());
  app.use(passport.session());

  // Allow HTTP requests from ports different from 3001
  app.use(cors);
}
