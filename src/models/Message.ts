import mongoose from 'mongoose';

export type MessageModel = mongoose.Document & {
  conversation: string;
  body: string;
  author: string;
};

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },
    body: {
      type: String,
      required: 'You cannot send a message without text.'
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

const Message = mongoose.model<MessageModel>('Message', messageSchema);
export default Message;
