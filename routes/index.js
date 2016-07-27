/* eslint-disable new-cap */

const express = require('express');
const cl = require('chalkline'); // https://github.com/niftylettuce/chalkline
const router = express.Router();
const _ = require('lodash');

/* GET home page. */
router.get('/', (req, res /* , next*/) => {
  cl.green();
  const isProduction = (req.app.get('env') === 'production');
  const params = _.merge({ title: 'Newspuppet', isProduction },
                        req.app.resourcesManifest);
  res.render('index', params);
});

module.exports = router;
