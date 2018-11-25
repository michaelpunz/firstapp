import { Request, Response, NextFunction } from 'express';
import Stage from '../models/Stage';
import Tour from '../models/Tour';

export const getTours = (req: Request, res: Response, next: NextFunction) => {
  return Tour.find({ artist: req.query.userId })
    .then(tours => {
      const toursStages = tours.map(tour => Stage.find({ tour: tour._id }).populate('offer event'));

      return Promise.all(toursStages).then(stagesOfTours => {
        const data = tours.map((tour, index) => ({
          ...tour.toJSON(),
          stages: stagesOfTours[index]
        }));

        return res.json({ status: 'success', data });
      });
    })
    .catch(next);
};

export const getTour = (req: Request, res: Response, next: NextFunction) => {
  return Tour.findById(req.params.id)
    .then(tour => {
      return Stage.find({ tour: tour._id })
        .populate('offer event')
        .then(stages => {
          return { ...tour.toJSON(), stages };
        });
    })
    .then(tourWithStages => res.json({ status: 'success', data: tourWithStages }))
    .catch(next);
};

export const postAddTour = (req: Request, res: Response, next: NextFunction) => {
  req.assert('name', 'name is a required field').notEmpty();
  req.assert('startLocation', 'location is a required field').notEmpty();
  req.assert('endLocation', 'location is a required field').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).json({ status: 'error', message: 'Invalid request', data: errors });
  }

  const newTour = new Tour({
    ...req.body,
    artist: req.user._id
  });

  return newTour
    .save()
    .then(tour => res.json({ status: 'success', data: tour }))
    .catch(next);
};

export const editTour = (req: Request, res: Response, next: NextFunction) => {
  return Tour.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(tour => {
      if (!tour) {
        return res.status(400).json({
          status: 'error',
          message: 'There is not a tour with this id',
          data: null
        });
      }
      return res.json({ status: 'success', data: tour });
    })
    .catch(next);
};

export const deleteTour = (req: Request, res: Response, next: NextFunction) => {
  return Tour.findById(req.params.id)
    .then(tour => tour.remove())
    .then(() => res.json({ status: 'success', data: null }))
    .catch(next);
};

export const getStages = (req: Request, res: Response, next: NextFunction) => {
  return Stage.find({ tour: req.params.tourId })
    .populate('event')
    .then(stages => res.json({ status: 'success', data: stages }))
    .catch(next);
};

export const getStage = (req: Request, res: Response, next: NextFunction) => {
  return Stage.findById(req.params.stageId)
    .populate('event')
    .then(stage => res.json({ status: 'success', data: stage }))
    .catch(next);
};

export const postAddStage = (req: Request, res: Response, next: NextFunction) => {
  req.assert('location', 'location is a required field').notEmpty();
  req.assert('date', 'date is a required field').isISO8601();
  req.assert('date', 'date must be in future').isAfter();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).json({ status: 'error', message: 'Invalid request', data: errors });
  }

  const newStage = new Stage({
    ...req.body,
    tour: req.params.tourId
  });

  return newStage
    .save()
    .then(stage => stage.populate('event'))
    .then(stage => res.json({ status: 'success', data: stage }))
    .catch(next);
};

export const editStage = (req: Request, res: Response, next: NextFunction) => {
  return Stage.findByIdAndUpdate(req.params.stageId, req.body, { new: true })
    .populate('event')
    .then(stage => {
      if (!stage) {
        return res.status(400).json({
          status: 'error',
          message: 'There is not a stage with this id',
          data: null
        });
      }

      return res.json({ status: 'success', data: stage });
    })
    .catch(next);
};

export const deleteStage = (req: Request, res: Response, next: NextFunction) => {
  return Stage.findByIdAndRemove(req.params.stageId)
    .then(() => res.json({ status: 'success', data: null }))
    .catch(next);
};
