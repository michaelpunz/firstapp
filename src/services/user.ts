import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import { IVerifyOptions } from 'passport-local';
import { promisify } from 'util';

import User, { UserModel } from '../models/User';

/**
 * POST /session
 * Automatically log in using the existing session
 */
export let postSession = (req: Request, res: Response) => {
  if (!req.user) return res.json({ status: 'error', message: 'No active session' });

  req.session.cookie.maxAge = 7 * 24 * 3600 * 1000; // 1 week

  return res.json({ status: 'success', data: req.user });
};

/**
 * POST /login
 * Sign in using email and password.
 */
export let postLogin = (req: Request, res: Response, next: NextFunction) => {
  req.assert('email', 'Email not valid').isEmail();
  req.assert('password', 'The password is required').notEmpty();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).json({ status: 'error', message: 'Invalid request', data: errors });
  }

  const login = promisify<any>(req.login.bind(req));

  return passport.authenticate('local', (err: Error, user: UserModel, info: IVerifyOptions) => {
    if (err) return next(err);

    if (!user) {
      return res.status(400).json({ status: 'error', message: info.message, data: null });
    }

    return login(user)
      .then(() => {
        req.session.cookie.maxAge = 7 * 24 * 3600 * 1000; // 1 week

        return res.json({ status: 'success', data: user });
      })
      .catch(next);
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
export const logout = (req: Request, res: Response) => {
  req.logout();

  res.json({ status: 'success', data: null });
};

/**
 * POST /signup
 * Create a new local user.
 */
export let postSignup = (req: Request, res: Response, next: NextFunction) => {
  req.assert('email', 'Email not valid').isEmail();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });
  req.assert('password', 'The password length must be of at least 6 characters').len({ min: 6 });
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).json({ status: 'error', message: 'Invalid request', data: errors });
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password
  });
  const login = promisify<any>(req.login.bind(req));

  return User.findOne({ email: req.body.email })
    .then(existingUser => {
      if (existingUser) {
        return res
          .status(400)
          .json({ status: 'error', message: 'The user is already existing', data: null });
      }

      return user
        .save()
        .then(() => login(user))
        .then(() => res.json({ status: 'success', data: user }));
    })
    .catch(next);
};

/**
 * POST /account/profile
 * Update profile information. This can be used on the second step of the
 * registration or when editing the profile
 */
export let postUpdateProfile = (req: Request, res: Response) => {
  req.assert('userType', 'Not a valid user type').matches(/Place|Artist|Viewer/);
  req.assert('profile.links.*.url', 'The link URL is not valid').isURL();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).json({ status: 'error', message: 'Invalid data', data: errors });
  }

  return User.findByIdAndUpdate(
    req.user._id,
    { type: req.body.userType, profile: req.body.profile },
    { new: true } // Return the modified user
  )
    .then(user => {
      if (!user) {
        return res.status(400).json({
          status: 'error',
          message: 'There is not an user with this id',
          data: null
        });
      }

      return res.json({ status: 'success', data: user });
    })
    .catch(err => {
      res.json({ status: 'error', data: err.message });
    });
};

/**
 * POST /account/credentials
 * Update current credentials.
 */
export const postUpdateCredentials = (req: Request, res: Response, next: NextFunction) => {
  req.assert('password', 'Password must be at least 6 characters long').len({ min: 6 });

  if (req.body.email) {
    req.assert('email', 'Email not valid').isEmail();
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });
  }

  if (req.body.newPassword) {
    req.assert('newPassword', 'Password must be at least 6 characters long').len({ min: 6 });
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.newPassword);
  }

  const errors = req.validationErrors();

  if (errors) return res.status(400).json({ status: 'error', data: errors });

  return User.findById(req.user._id)
    .then(user => {
      if (!user.comparePassword(req.body.password)) {
        return res
          .status(400)
          .json({ status: 'error', message: 'The current password is wrong', data: null });
      }

      if (req.body.email) {
        user.email = req.body.email;
      }

      if (req.body.newPassword) {
        user.password = req.body.newPassword;
      }

      return user.save().then(savedUser => res.json({ status: 'success', data: savedUser }));
    })
    .catch(err => {
      // MongoDB error with duplicate email
      if (err.code === 11000) {
        return res.status(400).json({
          status: 'error',
          message: 'The email is already associated with an user',
          data: null
        });
      }

      return next(err);
    });
};

/**
 * POST /account/delete
 * Delete user.
 */
export const postDeleteAccount = (req: Request, res: Response, next: NextFunction) => {
  req.assert('password', 'Password must be at least 6 characters long').len({ min: 6 });

  return User.findById(req.user._id)
    .then(user => {
      const registeredWithEmail = !user.facebook && !user.google;

      if (registeredWithEmail && !user.comparePassword(req.body.password)) {
        return res
          .status(400)
          .json({ status: 'error', message: 'The password is wrong', data: null });
      }

      return user.remove().then(() => {
        req.logout();
        return res.json({ status: 'success', data: null });
      });
    })
    .catch(next);
};

// Return all the users of a type in the DB
export const getUsers = (req: Request, res: Response, next: NextFunction) => {
  return User.find({ type: req.query.userType })
    .then(users => res.json({ status: 'success', data: users }))
    .catch(next);
};

export const getUserById = (req: Request, res: Response, next: NextFunction) => {
  return User.findById(req.params.id)
    .then(user => res.json({ status: 'success', data: user }))
    .catch(next);
};
