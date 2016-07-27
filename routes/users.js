/* eslint-disable new-cap */

const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res /* , next */) => {
  res.send('nodejs: respond with a list of users');
});

module.exports = router;
