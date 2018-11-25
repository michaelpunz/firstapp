import { Request, Response, NextFunction } from 'express';
import Event from '../models/Event';
import User from '../models/User';
import Partecipation from '../models/Partecipation';

export const getEvents = (req: Request, res: Response, next: NextFunction) => {
  req.assert('userType', 'Not a valid user type').matches(/Place|Artist|Viewer/);
  req.assert('userId', 'userId is required').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).json({ status: 'error', message: 'Invalid data', data: errors });
  }

  const userType = req.query.userType;
  let query;

  if (userType === 'Artist') {
    query = Event.find({ artists: req.query.userId }).populate('artists place');
  } else if (userType === 'Place') {
    query = Event.find({ place: req.query.userId }).populate('artists place');
  } else {
    query = Partecipation.find({ user: req.query.userId })
      .populate({
        path: 'event',
        populate: { path: 'artists place' }
      })
      .then(partecipations => partecipations.map(x => x.event));
  }

  return (query as Promise<Event[]>)
    .then(events => res.json({ status: 'success', data: events }))
    .catch(next);
};

export const getEventById = (req: Request, res: Response, next: NextFunction) => {
  return Event.findById(req.params.id)
    .populate('artists place')
    .then(event => res.json({ status: 'success', data: event }))
    .catch(next);
};

export const addEvent = (req: Request, res: Response, next: NextFunction) => {
  req.assert('name', 'name is a required field').notEmpty();
  req.assert('description', 'description is a required field').notEmpty();
  req.assert('location', 'location is a required field').notEmpty();
  req.assert('date', 'date is a required field').isISO8601();
  req.assert('date', 'date must be in future').isAfter();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).json({ status: 'error', message: 'Invalid request', data: errors });
  }

  return User.findById(req.user._id)
    .then(place => {
      const newEvent = new Event({
        ...req.body,
        place: req.user._id,
        _placeName: place.profile.fullname
      });
      return newEvent.save();
    })
    .then(event => res.json({ status: 'success', data: event }))
    .catch(next);
};

export const editEvent = (req: Request, res: Response, next: NextFunction) => {
  req.assert('name', 'name is a required field').notEmpty();
  req.assert('description', 'description is a required field').notEmpty();
  req.assert('location', 'location is a required field').notEmpty();
  req.assert('date', 'date is a required field').isISO8601();
  req.assert('date', 'date must be in future').isAfter();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).json({ status: 'error', message: 'Invalid request', data: errors });
  }

  const artistsQueries = (req.body.artists as string[]).map(artistId => User.findById(artistId));

  return Promise.all(artistsQueries)
    .then(artists => {
      return User.findById(req.user._id).then(place => {
        return Event.findByIdAndUpdate(
          req.params.id,
          {
            ...req.body,
            place: req.user._id,
            _placeName: place.profile.fullname,
            _artistsNames: artists.map(artist => artist.profile.fullname)
          },
          { new: true } // return the modified event
        );
      });
    })
    .then(event => {
      if (!event) {
        return res.status(400).json({
          status: 'error',
          message: 'There is not an event with this id',
          data: null
        });
      }
      return res.json({ status: 'success', data: event });
    })
    .catch(next);
};

export const deleteEvent = (req: Request, res: Response, next: NextFunction) => {
  return Event.findById(req.params.id)
    .then(event => {
      if (!event) {
        return res.json({ status: 'error', message: 'There is no event with that id' });
      }

      return event.remove().then(() => res.json({ status: 'success' }));
    })
    .catch(next);
};
