/* eslint-disable new-cap */
const express = require('express');
const router = express.Router();
const Category = require('../models/category');


/* GET users listing. */
router.get('/index.json', (req, res /* , next */) => {
  console.log("ROUTE: /index.json");
  const rdb = req.app.locals.rdb;

  rdb.table('categories').orderBy('priority').run()
    .then((results) => {
      console.log(`/categories got: ${JSON.stringify(results)}`);
      res.json(results);
    });
});

router.get('/:id.json', (req, res /* , next */) => {
  console.log("ROUTE: /:id.json");

  const categoryId = req.params.id;
  console.log(`ROUTE: /categories/${categoryId}`);

  Category.feedItems(req.app.locals.rdb, categoryId)
    .then((results) => {
      if (results) return res.json({ status: 'ok', results });
      return res.json({ status: 'error', description: 'No such categoryId' });
    });
});

module.exports = router;
