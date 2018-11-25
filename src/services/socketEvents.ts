import { logger } from '../logger';

export default function(io) {
  io.use(function(socket, next) {
    if (socket.handshake.query && socket.handshake.query.token) {
      const token = socket.handshake.query.token;

      if (token) {
        // Transform token to user_id (either by retrieving from db or by decoding)
        socket.user = token;
        next();
      } else {
        logger.info('user refused');
        next(new Error('Chat authentication error'));
      }
    } else {
      logger.info('user refused');
      next(new Error('Chat authentication error'));
    }
  });

  // Set socket.io listeners.
  io.on('connection', socket => {
    logger.info(`user ${socket.user} connected`);

    // On conversation entry, join broadcast channel
    socket.on('enter conversation', conversation => {
      socket.join(conversation);
      logger.info(`user ${socket.user} joined conversation ${conversation}`);
    });

    socket.on('leave conversation', conversation => {
      socket.leave(conversation);
      logger.info(`user ${socket.user} left conversation ${conversation}`);
    });

    socket.on('new message', conversation => {
      logger.info('new message in ' + conversation);
      io.sockets.in(conversation).emit('refresh conversation', conversation);
    });

    socket.on('change offer', conversation => {
      logger.info('new offer in ' + conversation);
      io.sockets.in(conversation).emit('refresh conversation', conversation);
    });

    socket.on('disconnect', () => {
      logger.info(`user ${socket.user} disconnected`);
    });
  });
}
