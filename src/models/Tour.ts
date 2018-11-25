import mongoose from 'mongoose';
import Stage from './Stage';

export type TourModel = mongoose.Document & {
  artist: string;
  name: string;
  startLocation: { type: string; coordinates: [number, number]; address: string };
  endLocation: { type: string; coordinates: [number, number]; address: string };
};

const tourSchema = new mongoose.Schema({
  name: String,
  startLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [
      {
        type: [Number, Number],
        required: 'You must provide the coordinates'
      }
    ],
    address: { type: String, required: 'You must provide the address' }
  },
  endLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [
      {
        type: [Number, Number],
        required: 'You must provide the coordinates'
      }
    ],
    address: { type: String, required: 'You must provide the address' }
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

tourSchema.pre('remove', function remove(next) {
  Stage.remove({ tour: this._id }).then(() => next());
});

const Tour = mongoose.model<TourModel>('Tour', tourSchema);
export default Tour;
