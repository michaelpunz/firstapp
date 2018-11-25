import passport from 'passport';
import passportLocal from 'passport-local';
import passportFacebook from 'passport-facebook';
import passportGoogle from 'passport-google-oauth';
import { find } from 'lodash';

import User, { UserModel } from '../models/User';
import { Request, Response, NextFunction } from 'express';

const LocalStrategy = passportLocal.Strategy;
const FacebookStrategy = passportFacebook.Strategy;
const GoogleStrategy = passportGoogle.OAuth2Strategy;

passport.serializeUser<any, any>((user, done) => {
  done(undefined, user._id);
});

passport.deserializeUser((userId, done) => {
  User.findById(userId)
    .then(user => done(undefined, user))
    .catch(err => done(err));
});

// Extend default Passport user interface
declare global {
  namespace Express {
    interface User extends UserModel {
      account: never;
    }
  }
}

/**
 * OAuth Strategy Overview
 *
 * - User is already logged in, sign in and we are done.
 * - User is not logged in.
 *   - Check if there is an existing user with user's email.
 *       - If there is, sign in and we are don.
 *       - Else create a new user.
 */

/**
 * Sign in with Google.
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: '/auth/google/callback',
      passReqToCallback: true
    },
    (req: Request, accessToken, refreshToken, profile, done) => {
      return User.findOne({ google: profile.id })
        .then(existingUser => {
          // Already registered, do nothing
          if (existingUser) return done(undefined, existingUser);

          return User.findOne({ email: profile._json.emails[0].value })
            .then(existingEmailUser => {
              // Already registered with email, save the Google id
              if (existingEmailUser) {
                existingEmailUser.google = profile.id;
                return existingEmailUser.save();
              }

              const user: UserModel = new User();
              user.email = profile._json.emails[0].value;
              user.google = profile.id;

              return user.save();
            })
            .then(user => done(undefined, user));
        })
        .catch(err => done(err));
    }
  )
);

/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ email: email.toLowerCase() }, (err, user: UserModel) => {
      if (err) return done(err);

      if (!user) {
        return done(undefined, false, { message: `Invalid email or password.` });
      }

      const isPasswordOkay = user.comparePassword(password);

      if (isPasswordOkay) return done(undefined, user);
      else return done(undefined, false, { message: 'Invalid email or password.' });
    });
  })
);

/**
 * Sign in with Facebook.
 */
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: '/auth/facebook/callback',
      profileFields: ['name', 'gender', 'picture', 'email', 'locale'],
      passReqToCallback: true
    },
    (req: Request, accessToken, refreshToken, profile, done) => {
      return User.findOne({ facebook: profile.id })
        .then(existingUser => {
          // Already registered, do nothing
          if (existingUser) return done(undefined, existingUser);

          return User.findOne({ email: profile._json.email })
            .then(existingEmailUser => {
              // Already registered with email, save the FB id
              if (existingEmailUser) {
                existingEmailUser.facebook = profile.id;
                return existingEmailUser.save();
              }

              const user: UserModel = new User();
              user.email = profile._json.email;
              user.facebook = profile.id;

              return user.save();
            })
            .then(user => done(undefined, user));
        })
        .catch(err => done(err));
    }
  )
);

/**
 * Login Required middleware.
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) return next();

  res.status(403).json({ status: 'error', message: 'Not authorized' });
};

/**
 * Authorization Required middleware.
 */
export const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
  const provider = req.path.split('/').slice(-1)[0];

  if (find(req.user.tokens, { kind: provider })) next();
  else res.redirect(`/auth/${provider}`);
};
