/* eslint-disable new-cap */
const express = require('express');
const router = express.Router();
const Category = require('../models/category');


/* GET users listing. */
router.get('/', (req, res /* , next */) => {
  const rdb = req.app.locals.rdb;

  rdb.table('categories').orderBy('priority').run()
    .then((results) => {
      res.json(results);
    });
});

router.get('/:id', (req, res /* , next */) => {
  const categoryId = req.params.id;

  Category.feedItems(req.app.locals.rdb, categoryId)
    .then((results) => {
      if (results) return res.json({ status: 'ok', results });
      return res.json({ status: 'error', description: 'No such categoryId' });
    });
});

module.exports = router;
