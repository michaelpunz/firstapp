import mongoose from 'mongoose';
import uuid from 'uuid/v4';
import Partecipation from './Partecipation';

export type EventModel = mongoose.Document & {
  artists: string[];
  name: string;
  description: string;
  picture: string;
  place: string;
  date: string;
  location: { type: string; coordinates: [number, number]; address: string };
  typologies: string[];
  price: number;
  qrcode: string;

  _placeName: string;
  _artistsNames: string[];
};

const eventSchema = new mongoose.Schema({
  artists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ],
  name: String,
  description: String,
  picture: String,
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: Date,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [
      {
        type: [Number, Number],
        required: 'You must provide the coordinates'
      }
    ],
    address: { type: String, required: 'You must provide the address' }
  },
  typologies: [String],
  price: Number,
  qrcode: String,

  /**
   * Extra fields to support text search by place/artists names since MongoDB
   * doesn't have joins or indexing referenced Schemas
   */
  _placeName: String,
  _artistsNames: [String]
});

eventSchema.index({
  name: 'text',
  _placeName: 'text',
  _artistsNames: 'text'
});

eventSchema.index({
  location: '2dsphere'
});

eventSchema.set('toJSON', {
  transform: function(doc, returned, options) {
    delete returned.__v;
    delete returned._placeName;
    delete returned._artistsNames;

    return returned;
  }
});

/**
 * Password hash middleware.
 */
eventSchema.pre('save', function save(next) {
  if (!this.qrcode) this.qrcode = uuid();

  next();
});

eventSchema.pre('remove', function remove(next) {
  Partecipation.remove({ event: this._id }).then(() => next());
});

const Event = mongoose.model<EventModel>('Event', eventSchema);
export default Event;
