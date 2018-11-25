import Feedback from '../models/Feedback';
import { Request, Response, NextFunction } from 'express';
import Partecipation from '../models/Partecipation';

/**
 * Get the feedback received by an user along with his average
 */
export let getFeedbacks = (req: Request, res: Response, next: NextFunction) => {
  const q: any = {};
  const author = req.query.author;
  const receiver = req.query.receiver;

  if (author) {
    q.author = author;
  }

  if (receiver) {
    q.receiver = receiver;
  }

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).json({ status: 'error', message: 'Invalid request', data: errors });
  }

  if (author) {
    return Feedback.find({ author })
      .populate('event receiver')
      .then(feedbacks => res.json({ status: 'success', data: feedbacks }))
      .catch(next);
  }

  if (receiver) {
    return Promise.all([
      Feedback.find({ receiver }).populate('event author'),
      Feedback.getAverage(receiver)
    ])
      .then(([feedbacks, average]) => {
        return res.json({ status: 'success', data: { feedbacks, average } });
      })
      .catch(next);
  }

  return next(new Error('Ricerca feedback nè per autore nè per ricevente'));
};

export const addFeedback = (req: Request, res: Response, next: NextFunction) => {
  req.assert('event', 'Event is a required field').notEmpty();
  req.assert('receiver', 'Receiver is a required field').notEmpty();
  req.assert('performanceRating', 'The performance stars is required').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).json({ status: 'error', message: 'Invalid request', data: errors });
  }

  const user = req.user;
  req.body.author = user._id;

  if (user.type === 'Viewer' && (req.body.reliabilityRating || req.body.reliabilityText)) {
    return res.status(400).json({
      status: 'error',
      message: 'The viewer cannot review the reliability',
      data: null
    });
  }

  const feedback = new Feedback(req.body);

  return feedback
    .save()
    .then(saved => {
      return Partecipation.findOneAndUpdate(
        { event: req.body.event, user: req.user._id },
        { hasReviewed: true }
      ).then(() => res.json({ status: 'success', data: saved }));
    })
    .catch(next);
};

export let deleteFeedback = (req: Request, res: Response, next: NextFunction) => {
  return Feedback.findById(req.params.id)
    .then(feedback => {
      if (feedback.author.toString() !== req.user._id.toString()) {
        return res
          .status(400)
          .json({ status: 'error', message: 'You cannot delete a review not yours', data: null });
      }

      return feedback.remove().then(() => {
        return Partecipation.findOneAndUpdate(
          { event: feedback.event, user: req.user._id },
          { hasReviewed: false }
        ).then(() => res.json({ status: 'success', data: null }));
      });
    })
    .catch(next);
};
