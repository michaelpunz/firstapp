import mongoose from 'mongoose';

export type FeedbackModel = mongoose.Document & {
  event: string;
  author: string;
  receiver: string;

  reliabilityRating: number;
  reliabilityText: number;
  performanceRating: number;
  performanceText: number;
};

const feedbackSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reliabilityRating: { type: Number, min: 1, max: 5 },
    reliabilityText: String,
    performanceRating: {
      type: Number,
      min: 1,
      max: 5,
      required: 'The stars valutation is required'
    },
    performanceText: String
  },
  { timestamps: true }
);

feedbackSchema.statics.getAverage = function(receiver: string) {
  return Feedback.aggregate() // tslint:disable-line
    .match({ receiver: mongoose.Types.ObjectId(receiver) })
    .group({
      _id: '$receiver',
      reliability: { $avg: '$reliabilityRating' },
      performance: { $avg: '$performanceRating' }
    })
    .then(results => (results[0] ? results[0] : null));
};

type WithStatics = mongoose.Model<FeedbackModel> & {
  getAverage: (receiver: string) => any;
};

const Feedback = mongoose.model<FeedbackModel, WithStatics>('Feedback', feedbackSchema);
export default Feedback;
