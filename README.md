Newspuppet
=====================
A hack project to play around with rss/atom feed data.

Technologies used
------------------
- React (Front end UI)
- Redux (Front end data store)
- ReactRouter (Front end routing)
- Javascript ES6 (Language for front/backend)
- Expressjs/Nodejs (Backend)
- RethinkDB (Data store)
- Beanstalk (Event bus)
- Webpack (For code assembly)
- Mocha/Chai (Testing)
- Docker (containers for beanstalk and rethinkdb)

## Getting Started

Make sure you have rethinkdb and beanstalkd installed and running.
There are docker images in $PROJECT_DIR/docker and
[Docker-For-Mac](https://docs.docker.com/docker-for-mac/) is a super easy way to start.

    npm install # install npm modules

    npm run dbSetup # deploy the db schema to rethinkdb

    node seed_data # populate with some feed links


## Running

For development (uses webpack-hot-middleware for hot reloading):

    npm run start




For prod - generate the minimized javascript files into /public with md5 hashes for css/js:

    rm -f public/resources/*; npm run build; NODE_ENV=production npm run start


Go [http://127.0.0.1:3000](http://127.0.0.1:3000)

## Tests

You can never have enough tests, but so far:

    npm test

## Author

* **Vlod Kalicun** ([Twitter](https://twitter.com/vlod) / [GitHub](https://github.com/vlod))

## License


Licensed under the MIT License
