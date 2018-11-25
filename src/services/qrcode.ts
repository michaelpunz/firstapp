import { Request, Response, NextFunction } from 'express';
import qrcode from 'qrcode';

import Event from '../models/Event';
import Partecipation from '../models/Partecipation';

export const getQRCode = (req: Request, res: Response, next: NextFunction) => {
  const eventId = req.params.id;

  return Event.findById(eventId)
    .then(event => {
      const code = event.qrcode;

      return qrcode
        .toDataURL(`${process.env.DOMAIN}/feedbacks/${eventId}?code=${code}`)
        .then(url => {
          res.json({ status: 'success', data: url });
        });
    })
    .catch(next);
};

export const postQRCode = (req: Request, res: Response, next: NextFunction) => {
  const eventId = req.params.id;
  const code = req.params.qrcode;

  return Event.findById(eventId)
    .then(event => {
      if (!event || event.qrcode !== code) {
        return res.json({
          status: 'error',
          message: 'The id or the QRCode of the event is invalid',
          data: null
        });
      }

      return Partecipation.findOneAndUpdate(
        {
          event: eventId,
          user: req.user._id
        },
        { canReview: true },
        { new: true } // Return the modified partecipation
      ).then(partecipation => res.json({ status: 'success', data: partecipation }));
    })
    .catch(next);
};
