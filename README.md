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
- Bootstrap/Sass (CSS)
- Docker (containers for beanstalk and rethinkdb)

A demo version is available at: [http://www.newspuppet.com](http://www.newspuppet.com)
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
Copyright (c) 2016 Vlod Kalicun

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.