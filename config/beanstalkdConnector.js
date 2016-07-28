const winston = require('winston');
const fivebeans = require('fivebeans');
const Beanworker = fivebeans.worker;

module.exports = () => {
  const emitter = new fivebeans.client('127.0.0.1', 11300);
  emitter.on('connect', (err) => {
    if (err) throw err;

    winston.info('emitter connected to beanstalkd');
    emitter.use('default', (err1) => {
      if (err1) throw err1;
      winston.info('emitter using (default)');
    });
  })
  .on('error', (err) => {
    winston.error('emitter client error:', { err });
  })
  .on('close', () => {
    winston.error('emitter client closed connection');
  })
  .connect();

  // connect to BeanWorker
  const beanWorkerConfig = {
    id: 'bs_worker_1',
    host: '127.0.0.1',
    port: 11300,
    ignoreDefault: true,
  };

  return {
    emitter,
    addHandlers: (handlers) => {
      beanWorkerConfig.handlers = handlers;

      const worker = new Beanworker(beanWorkerConfig);
      worker.on('error', (err) => {
        winston.log('error', 'problem connecting to beanstalkd:', { err });
      });
      worker.start();
    },
  };
};

