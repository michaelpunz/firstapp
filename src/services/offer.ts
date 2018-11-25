import { Request, Response, NextFunction } from 'express';
import Offer from '../models/Offer';
import Event from '../models/Event';
import { UserModel } from '../models/User';

export const getOffers = (req: Request, res: Response, next: NextFunction) => {
  const userField = req.user.type === 'Artist' ? 'artist' : 'place';
  const query = { [userField]: req.user._id };

  if (req.query.recipientId) {
    const recipientField = userField === 'artist' ? 'place' : 'artist';
    query[recipientField] = req.query.recipientId;
  }

  return Offer.find(query)
    .sort('date')
    .populate('event artist place')
    .then(offers => res.status(200).json({ status: 'success', data: offers }))
    .catch(next);
};

export const getEventOffer = (req: Request, res: Response, next: NextFunction) => {
  req.assert('recipientId', 'recipientId is a required field').notEmpty();
  req.assert('eventId', 'eventId is a required field').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).json({ status: 'error', message: 'Invalid request', data: errors });
  }

  const userField = req.user.type === 'Artist' ? 'artist' : 'place';
  const recipientField = userField === 'artist' ? 'place' : 'artist';

  return Offer.findOne({
    [userField]: req.user._id,
    [recipientField]: req.query.recipientId,
    event: req.query.eventId
  })
    .populate('event artist place')
    .then(offer => {
      return res.status(200).json({ status: 'success', data: offer });
    })
    .catch(next);
};

export const postOffer = (req: Request, res: Response, next: NextFunction) => {
  req.assert('price', 'price is a required field').notEmpty();
  req.assert('date', 'date is a required field').isISO8601();
  req.assert('date', 'date must be in future').isAfter();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({ status: 'error', message: 'Invalid request', data: errors });
  }

  const userField = req.user.type === 'Artist' ? 'artist' : 'place';
  const recipientField = userField === 'artist' ? 'place' : 'artist';
  const offer = new Offer({
    date: new Date(req.body.date),
    price: req.body.price,
    event: req.body.event,
    [userField]: req.user._id,
    [recipientField]: req.body.recipientId
  });

  return offer
    .save()
    .then(savedOffer => savedOffer.populate('event artist place'))
    .then(savedOffer => {
      res.status(200).json({ status: 'success', data: savedOffer });
    })
    .catch(next);
};

const editOffer = (req: Request, res: Response, next: NextFunction) => {
  return Offer.findByIdAndUpdate(
    req.params.offerId,
    {
      date: new Date(req.body.date),
      price: req.body.price,
      event: req.body.event
    },
    { new: true }
  )
    .populate('event artist place')
    .then(offer => res.status(200).json({ status: 'success', data: offer }))
    .catch(next);
};

const acceptOffer = (req: Request, res: Response, next: NextFunction) => {
  const field = req.user.type === 'Artist' ? 'artistAcceptDate' : 'placeAcceptDate';

  return Offer.findByIdAndUpdate(req.params.offerId, { [field]: new Date() }, { new: true })
    .populate('event artist place')
    .then(offer => {
      if (!offer.artistAcceptDate || !offer.placeAcceptDate) return offer;

      const artist = (offer.artist as any) as UserModel;
      const place = (offer.place as any) as UserModel;

      if (offer.event) {
        return Event.findByIdAndUpdate(offer.event, {
          $push: {
            artists: artist._id,
            _artistsNames: artist.profile.fullname
          }
        }).then(() => offer);
      }

      // Create a new event if it doesn't exist yet
      const newEvent = new Event({
        artists: [artist._id],
        name: 'New event',
        description: 'Description',
        picture: 'http://via.placeholder.com/960x768',
        place: place._id,
        date: offer.date,
        location: place.profile.location,
        typologies: place.profile.typologies,

        _placeName: place.profile.fullname,
        _artistsNames: [artist.profile.fullname]
      });

      return newEvent
        .save()
        .then(savedEvent => Offer.findByIdAndUpdate(offer._id, { event: savedEvent._id }))
        .then(offerWithEvent => offerWithEvent.populate('event artist place'));
    })
    .then(offer => res.status(200).json({ status: 'success', data: offer }))
    .catch(next);
};

const declineOffer = (req: Request, res: Response, next: NextFunction) => {
  req.assert('declineReason', 'declineReason is a required field').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({ status: 'error', message: 'Invalid request', data: errors });
  }
  return Offer.findByIdAndUpdate(
    req.params.offerId,
    {
      artistAcceptDate: null,
      placeAcceptDate: null,
      declineAuthor: req.user._id,
      declineDate: new Date(),
      declineReason: req.body.declineReason
    },
    { new: true }
  )
    .populate('event artist place')
    .then(offer => res.status(200).json({ status: 'success', data: offer }))
    .catch(next);
};

export const patchOffer = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.action === 'edit') return editOffer(req, res, next);
  else if (req.body.action === 'accept') return acceptOffer(req, res, next);
  else if (req.body.action === 'decline') return declineOffer(req, res, next);
  else return res.status(400).json({ status: 'error', message: 'Unknown action on the offer' });
};
