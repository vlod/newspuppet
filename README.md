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

Installation
------------
npm i

Running
------------

For dev - run node in development mode (uses webpack-hot-middleware):

    # rm -rf public/resources;  # only if you've previous run in production mode
    npm run start

For prod - generate the javascript files into /public with md5 hashes for css/js:

    rm -f public/resources/*; npm run build; NODE_ENV=production npm run start

Hit

    http://127.0.0.1:3000/

Authors
-------

* **Vlod Kalicun** ([Twitter](https://twitter.com/vlod) / [GitHub](https://github.com/vlod))

License
-------

Licensed under the MIT License
