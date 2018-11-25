import mongoose from 'mongoose';

export type ConversationModel = mongoose.Document & {
  artist: string;
  place: string;
};

const conversationSchema = new mongoose.Schema({
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
}, { timestamps: true });

const Conversation = mongoose.model<ConversationModel>('Conversation', conversationSchema);
export default Conversation;