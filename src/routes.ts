import express from 'express';
import path from 'path';
import passport from 'passport';
import { isAuthenticated } from './middlewares/auth';
import { upload } from './middlewares/upload';

import * as contactService from './services/contact';
import * as userService from './services/user';
import * as searchService from './services/search';
import * as eventService from './services/event';
import * as tourService from './services/tour';
import * as feedbackService from './services/feedback';
import * as partecipationService from './services/partecipation';
import * as qrcodeService from './services/qrcode';

import * as chatService from './services/chat';
import * as offerService from './services/offer';

import * as uploadService from './services/upload';
import * as errorService from './services/error';

const router = express.Router();

function staticService(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
}

// Order: GET, POST, PUT, PATCH e DELETE

router.get('/', staticService);

router.post('/api/contact', contactService.postContact);

router.get('/api/chat', isAuthenticated, chatService.getConversations);
router.post('/api/chat', isAuthenticated, chatService.postConversation);
router.get('/api/chat/:conversationId', isAuthenticated, chatService.getConversation);
router.post('/api/chat/:conversationId', isAuthenticated, chatService.postMessage);
router.patch('/api/chat/:conversationId', isAuthenticated, chatService.updateMessage);
router.delete('/api/chat/:conversationId', isAuthenticated, chatService.deleteConversation);

router.get('/api/offers', isAuthenticated, offerService.getOffers);
router.get('/api/offers/event', isAuthenticated, offerService.getEventOffer);
router.post('/api/offers', isAuthenticated, offerService.postOffer);
router.patch('/api/offers/:offerId', isAuthenticated, offerService.patchOffer);

router.post('/api/session', isAuthenticated, userService.postSession);
router.post('/api/signup', userService.postSignup);
router.post('/api/login', userService.postLogin);
router.get('/api/logout', isAuthenticated, userService.logout);

router.post('/api/account/profile', isAuthenticated, userService.postUpdateProfile);
router.post('/api/account/credentials', isAuthenticated, userService.postUpdateCredentials);
router.post('/api/account/delete', isAuthenticated, userService.postDeleteAccount);

router.get('/api/users', userService.getUsers);
router.get('/api/users/:id', userService.getUserById);

router.get('/api/search', searchService.getSearch);
router.get('/api/search/nearest', searchService.getNearest);

router.get('/api/events', eventService.getEvents);
router.get('/api/events/:id', eventService.getEventById);
router.post('/api/events', isAuthenticated, eventService.addEvent);
router.patch('/api/events/:id', isAuthenticated, eventService.editEvent);
router.delete('/api/events/:id', isAuthenticated, eventService.deleteEvent);

router.get(
  '/api/events/:id/partecipations/me',
  isAuthenticated,
  partecipationService.getPartecipation
);
router.post(
  '/api/events/:id/partecipations/me',
  isAuthenticated,
  partecipationService.postAddPartecipation
);
router.delete(
  '/api/events/:id/partecipations/me',
  isAuthenticated,
  partecipationService.deletePartecipation
);
router.get('/api/events/:id/partecipations/count', partecipationService.getNumberOfPartecipants);
router.get('/api/partecipations', partecipationService.getUserPartecipations);

router.get('/api/events/:id/qrcode', isAuthenticated, qrcodeService.getQRCode);
router.post('/api/events/:id/qrcode/:qrcode', isAuthenticated, qrcodeService.postQRCode);

router.get('/api/tours', tourService.getTours);
router.get('/api/tours/:id', tourService.getTour);
router.post('/api/tours', isAuthenticated, tourService.postAddTour);
router.patch('/api/tours/:id', isAuthenticated, tourService.editTour);
router.delete('/api/tours/:id', isAuthenticated, tourService.deleteTour);

router.get('/api/tours/:tourId/stages', tourService.getStages);
router.get('/api/tours/:tourId/stages/:stageId', tourService.getStage);
router.post('/api/tours/:tourId/stages', isAuthenticated, tourService.postAddStage);
router.patch('/api/tours/:tourId/stages/:stageId', isAuthenticated, tourService.editStage);
router.delete('/api/tours/:tourId/stages/:stageId', isAuthenticated, tourService.deleteStage);

router.get('/api/feedbacks', feedbackService.getFeedbacks);
router.post('/api/feedbacks', isAuthenticated, feedbackService.addFeedback);
router.delete('/api/feedbacks/:id', isAuthenticated, feedbackService.deleteFeedback);

router.post(
  '/api/upload/:folder',
  isAuthenticated,
  upload.single('picture'),
  uploadService.postUpload
);

router.post('/api/errors', errorService.postError);

/**
 * OAuth authentication routes. (Sign in Facebook)
 */
router.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: ['email', 'public_profile'] })
);
router.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/app');
  }
);

/*
* OAuth autentication routes. (Sing in Google)
*/
router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/app');
  }
);

/**
 * Return the React application for any GET route not handled by the server. If it's
 * unknown the front-end will show 404 page, but it's not back-end business.
 */
router.get('*', (req, res) => {
  if (!res.headersSent) staticService(req, res);
});

export default router;
