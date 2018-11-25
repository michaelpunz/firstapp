import socket from 'socket.io';
import app from './app';
import socketEvents from './services/socketEvents';
import http from 'http';

if (app.get('env') === 'development') {
  require('source-map-support').install();
}

/**
 * Start Express server.
 */
const server = app.listen(app.get('port'), () => {
  console.log(`App is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`);
  console.log('Press CTRL-C to stop\n');
});

socketEvents(socket.listen(server));

// A ping interval to keep Heroku awake
setInterval(() => {
  http.get('http://tutourself.herokuapp.com');
}, 10 * 60 * 1000); // every 10 minutes

export default server;
