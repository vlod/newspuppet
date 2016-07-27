Newspuppet
=====================
Load rss/atom feed data.

Dependencies
------------
- bootstrap
- sass
- webpack-hot-middleware
- expressjs
- react-router
- webpack-md5-hash
- beanstalkd

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
