import { Request, Response, NextFunction } from 'express';
import Event from '../models/Event';
import { Model } from 'mongoose';
import { startOfDay, endOfDay } from 'date-fns';
import User from '../models/User';

/**
 * Search users
 */

type SearchQuery = {
  fullname?: string;
  lng?: number;
  lat?: number;
  typologies?: string[];

  // Only for events
  eventPlaceName?: string;
  eventArtistName?: string;
  eventDateFrom?: string;
  eventDateTo?: string;
};

function find(type: 'Artist' | 'Place' | 'Event', query: SearchQuery) {
  const isEvent = type === 'Event';
  const model: Model<any> = isEvent ? Event : User;

  const q: any = {};

  if (!isEvent) {
    q.type = type;
  }

  if (query.fullname) {
    q.$text = { $search: query.fullname };
  }

  if (query.lng && query.lat) {
    q[isEvent ? 'location' : 'profile.location'] = {
      $geoWithin: {
        // MongoDB doesn't allow both $near and $text
        $center: [[query.lng, query.lat], 10 / 111.12] // 10km of radius, the distance is in radius
      }
    };
  }

  if (query.typologies) {
    q[isEvent ? 'typologies' : 'profile.typologies'] = { $in: query.typologies };
  }

  if (type === 'Event') {
    /**
     * Append place/artist name to the text search query if existing
     * https://docs.mongodb.com/manual/reference/operator/query/text/#match-any-of-the-search-terms
     */

    if (query.eventPlaceName) {
      q.$text = q.$text
        ? { $search: `${q.$text.$search} ${query.eventPlaceName}` }
        : { $search: query.eventPlaceName };
    }

    if (query.eventArtistName) {
      q.$text = q.$text
        ? { $search: `${q.$text.$search} ${query.eventArtistName}` }
        : { $search: query.eventArtistName };
    }

    // Return only future events by default
    q.date = { $gte: startOfDay(query.eventDateFrom || new Date()) };

    if (query.eventDateTo) {
      q.date = q.date || {};
      q.date.$lte = endOfDay(query.eventDateTo);
    }
  }

  return type === 'Event'
    ? model
        .find(q)
        .sort({ date: 'asc' })
        .populate('artists place')
    : model.find(q).limit(10);
}

/**
 * Finds the nearest users in a location. It's different from `searchUsers` which
 * finds only within an area
 */
function findNearest(type: 'Artist' | 'Place' | 'Event', lng: number, lat: number) {
  const isEvent = type === 'Event';
  const model: Model<any> = isEvent ? Event : User;

  return model
    .find({
      [isEvent ? 'location' : 'profile.location']: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: 1000 * 10 // 10km, with 2dsphere the distance is in km
        }
      }
    })
    .limit(10);
}

/**
 * ROUTE Services
 */

export let getSearch = (req: Request, res: Response, next: NextFunction) => {
  req.assert('type', 'The type of search is required').notEmpty();
  req.assert('type', 'The type of search is not valid').matches(/Place|Artist|Event/);
  const query: SearchQuery = {};

  if (req.query.fullname) {
    req.sanitize('fullname').escape();
    query.fullname = req.query.fullname;
  }

  if (req.query.lng && req.query.lat) {
    req.assert('lng', 'La latitudine deve essere numerica').isDecimal();
    req.assert('lat', 'La longitudine deve essere numerica').isDecimal();

    const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
    query.lng = coordinates[0];
    query.lat = coordinates[1];
  }

  if (req.query.typologies) {
    query.typologies = req.query.typologies.split(',');
  }

  if (req.query.type === 'Event') {
    if (req.query.eventPlaceName) {
      req.sanitize('eventPlaceName').escape();
      query.eventPlaceName = req.query.eventPlaceName;
    }

    if (req.query.eventArtistName) {
      req.sanitize('eventArtistName').escape();
      query.eventArtistName = req.query.eventArtistName;
    }

    if (req.query.eventDateFrom) {
      req.assert('eventDateFrom', 'La data deve essere in formato ISO8601').isISO8601();
      query.eventDateFrom = req.query.eventDateFrom;
    }

    if (req.query.eventDateTo) {
      req.assert('eventDateTo', 'La data deve essere in formato ISO8601').isISO8601();
      query.eventDateTo = req.query.eventDateTo;
    }
  }

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).json({ status: 'error', message: 'Dati non validi', data: errors });
  }

  return find(req.query.type, query)
    .then(results => {
      return res.json({ status: 'success', data: results });
    })
    .catch(next);
};

export let getNearest = (req: Request, res: Response, next: NextFunction) => {
  req.assert('type', 'The type of search is required').notEmpty();
  req.assert('type', 'The type of search is not valid').matches(/Place|Artist|Event/);
  req.assert('lng', 'The longitude must be numeric').notEmpty();
  req.assert('lat', 'The latitude must be numeric').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).json({ status: 'error', message: 'Dati non validi', data: errors });
  }

  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);

  return findNearest(req.query.type, coordinates[0], coordinates[1])
    .then(results => {
      return res.json({ status: 'success', data: results });
    })
    .catch(next);
};
