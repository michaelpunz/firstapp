import mongoose from 'mongoose';

export type PartecipationModel = mongoose.Document & {
  event: string;
  user: string;
  canReview: boolean;
  hasReviewed: boolean;
};

const partecipationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  canReview: { type: Boolean, default: false },
  hasReviewed: { type: Boolean, default: false }
});

const Partecipation = mongoose.model<PartecipationModel>('Partecipation', partecipationSchema);
export default Partecipation;
