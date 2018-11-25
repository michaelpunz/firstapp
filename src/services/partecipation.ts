import { Request, Response, NextFunction } from 'express';

import Partecipation from '../models/Partecipation';

export const getPartecipation = (req: Request, res: Response, next: NextFunction) => {
  return Partecipation.findOne({
    event: req.params.id,
    user: req.user._id
  })
    .then(partecipation => res.json({ status: 'success', data: partecipation }))
    .catch(next);
};

export const postAddPartecipation = (req: Request, res: Response, next: NextFunction) => {
  const newPartecipation = new Partecipation({ event: req.params.id, user: req.user._id });

  return newPartecipation
    .save()
    .then(partecipation => res.json({ status: 'success', data: partecipation }))
    .catch(next);
};

export const deletePartecipation = (req: Request, res: Response, next: NextFunction) => {
  return Partecipation.findOneAndRemove({
    event: req.params.id,
    user: req.user._id
  })
    .then(() => res.json({ status: 'success', data: null }))
    .catch(next);
};

export const getNumberOfPartecipants = (req: Request, res: Response, next: NextFunction) => {
  return Partecipation.count({
    event: req.params.id
  })
    .then(count => res.json({ status: 'success', data: count }))
    .catch(next);
};

export const getUserPartecipations = (req: Request, res: Response, next: NextFunction) => {
  return Partecipation.find({
    user: req.query.userId
  })
    .then(partecipations => res.json({ status: 'success', data: partecipations }))
    .catch(next);
};
