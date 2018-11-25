import mongoose from 'mongoose';

export type OfferModel = mongoose.Document & {
  date: string;
  price: number;
  event?: string;
  artist: string;
  place: string;
  artistAcceptDate: string;
  placeAcceptDate: string;
  declineAuthor: string;
  declineDate: string;
  declineReason: string;
};

const offerSchema = new mongoose.Schema(
  {
    date: { type: Date, required: 'The date of the performance is required' },
    price: Number,
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    artistAcceptDate: Date,
    placeAcceptDate: Date,
    declineAuthor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    declineDate: Date,
    declineReason: String
  },
  { timestamps: true }
);

const Offer = mongoose.model<OfferModel>('Offer', offerSchema);
export default Offer;
