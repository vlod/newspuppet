/* eslint-disable no-console */

const joblist = [
  { type: 'get_feed', payload: { feedId: 1 } }, // news.ycombinator.com
  { type: 'get_feed', payload: { feedId: 2 } }, // bbc
  { type: 'get_feed', payload: { feedId: 3 } }, // washingtonpost.com
  { type: 'get_feed', payload: { feedId: 4 } }, // arstechnica
  { type: 'get_feed', payload: { feedId: 5 } }, // engadget
  { type: 'get_feed', payload: { feedId: 6 } }, // gizmodo
  { type: 'get_feed', payload: { feedId: 7 } }, // Techcrunch
  { type: 'get_feed', payload: { feedId: 8 } }, // ReadWrite
  { type: 'get_feed', payload: { feedId: 9 } }, // TheNextWeb
  { type: 'get_feed', payload: { feedId: 10 } }, // TheVerge
];

const fivebeans = require('fivebeans');
const emitter = new fivebeans.client('0.0.0.0', 11300);

const doneEmittingJobs = () => {
  console.log('We reached our completion callback. Now closing down.');
  emitter.end();
  process.exit(0);
};

const continuer = (err, jobid) => {
  console.log(`emitted job id: ${jobid}`);
  if (joblist.length === 0) {
    return doneEmittingJobs();
  }

  return emitter.put(0, 0, 60, JSON.stringify(['default', joblist.shift()]), continuer);
};

emitter.on('connect', () => {
  emitter.use('default', (err) => {
    if (err) throw err;
    emitter.put(0, 0, 60, JSON.stringify(['default', joblist.shift()]), continuer);
  });
});

emitter.on('error', (err) => {
  console.log(`client error: ${err}`);
});
emitter.connect();
