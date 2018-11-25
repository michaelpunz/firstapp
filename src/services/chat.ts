import { Request, Response, NextFunction } from 'express';
import Conversation from '../models/Conversation';
import Message from '../models/Message';

export const getConversations = (req: Request, res: Response, next: NextFunction) => {
  const userType = req.user.type === 'Artist' ? 'artist' : 'place';

  return Conversation.find({ [userType]: req.user._id })
    .populate('artist place')
    .sort('-createdAt')
    .then(conversations => {
      const conversationsMsgs = conversations.map(conversation => {
        return Message.find({ conversation: conversation._id })
          .sort('-createdAt')
          .limit(1); // Only return one message from each conversation to display as snippet
      });

      return Promise.all(conversationsMsgs).then(conversationMsgs => {
        const data = conversations.map((conversation, index) => ({
          ...conversation.toJSON(),
          messages: conversationMsgs[index]
        }));

        return res.json({ status: 'success', data });
      });
    })
    .catch(next);
};

export const getConversation = (req: Request, res: Response, next: NextFunction) => {
  return Message.find({ conversation: req.params.conversationId })
    .then(messages => res.status(200).json({ status: 'success', data: messages }))
    .catch(next);
};

export const postConversation = (req: Request, res: Response, next: NextFunction) => {
  req.assert('message', 'Please enter a message.').notEmpty();
  req.assert('recipient', 'The recipient cannot be empty.').notEmpty();

  const composedMsg: string = req.body.message;
  const authorType = req.user.type === 'Artist' ? 'artist' : 'place';
  const recipientType = authorType === 'artist' ? 'place' : 'artist';
  const recipient = req.body.recipient;

  /**
   * Find an existing conversation of this user with this recipient.
   * If it doesn't exist create new one, else switch to existing conversation.
   */
  return Conversation.findOne({ [authorType]: req.user._id, [recipientType]: recipient })
    .then(conversation => {
      if (conversation) {
        const reply = new Message({
          // set the _id of conversation to the existing conversation
          conversation: conversation._id,
          body: composedMsg,
          author: req.user._id
        });

        return reply.save().then(sentReply => [sentReply, conversation]);
      } else {
        const newConversation = new Conversation({
          [authorType]: req.user._id,
          [recipientType]: recipient
        });

        return newConversation.save().then(savedConversation => {
          const message = new Message({
            conversation: savedConversation._id,
            body: composedMsg,
            author: req.user._id
          });

          return message.save().then(newMessage => [newMessage, newConversation]);
        });
      }
    })
    .then(([message, conversation]) => {
      return res.status(200).json({
        status: 'success',
        data: { message, conversation }
      });
    })
    .catch(next);
};

// send a reply in a existing conversation
export const postMessage = (req: Request, res: Response, next: NextFunction) => {
  req.assert('message', 'message is a required field').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).json({ status: 'error', message: 'Invalid request', data: errors });
  }

  const reply = new Message({
    conversation: req.params.conversationId,
    body: req.body.message,
    author: req.user._id
  });

  return reply
    .save()
    .then(sentReply => res.status(200).json({ status: 'success', data: sentReply }))
    .catch(next);
};

/**
 * Updating and deleting messages are not currently supported in the front-end
 * to keep the conversation as faithful history
 */

export const updateMessage = (req: Request, res: Response, next: NextFunction) => {
  return Message.findOneAndUpdate(
    {
      $and: [{ _id: req.body.messageId }, { author: req.user._id }]
    },
    { body: req.body.message },
    { new: true } // Return the modified message
  )
    .then(message => {
      return res.json({ status: 'success', data: message });
    })
    .catch(next);
};

export const deleteConversation = (req: Request, res: Response, next: NextFunction) => {
  const authorType = req.user.type === 'Artist' ? 'artist' : 'place';

  return Conversation.findOneAndRemove({
    $and: [{ _id: req.params.conversationId }, { [authorType]: req.user._id }]
  })
    .then(() => res.status(200).json({ status: 'success', data: null }))
    .catch(next);
};
