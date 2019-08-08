# TuTourSelf 

[![CircleCI](https://circleci.com/gh/BlackSheepTeam/TuTourSelf.svg?style=svg&circle-token=0fbc23bb711c81a4c9249cb2b584e44ef8f68108)](https://circleci.com/gh/BlackSheepTeam/TuTourSelf)

The team has based its back-end project on [Typescript-Node-Starter](https://github.com/Microsoft/TypeScript-Node-Starter), with heavy customisations like [ReactJS](https://reactjs.org) instead of a static [Pug](https://pugjs.org/api/getting-started.html) template and the addition of Google authentication. The original project has also been simplified and several packages have been removed to keep the dependencies minimal.

# Getting started
- Install dependencies
```
cd <project_name>
npm install
```
- Configure your mongoDB server
```
# create the db directory
sudo mkdir -p /data/db
# give the db correct read/write permissions
sudo chmod 777 /data/db
```
- Start your mongoDB server (you'll probably want another command prompt)
```
mongod
```
- Build and run the back-end which serves also the front-end
```
npm run build
npm start
```
Navigate to `http://localhost:3001`

- You can also watch the back-end files for changes
```
npm run watch
```
