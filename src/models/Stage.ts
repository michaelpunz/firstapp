import mongoose from 'mongoose';

export type StageModel = mongoose.Document & {
  offer: string;
  event: string;
  location: { type: string; coordinates: [number, number]; address: string };
  date: string;
  tour: string;
};

const stageSchema = new mongoose.Schema({
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
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
  date: Date,
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour'
  }
});

const Stage = mongoose.model<StageModel>('Stage', stageSchema);
export default Stage;
