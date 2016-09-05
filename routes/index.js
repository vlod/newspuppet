// require route files
const express = require('express');
const	root = require('./root');
const	categories = require('./categories');

// attach route files to paths
const router = express.Router();

router.use('/categories', categories);
router.use('/category/:id', root);
router.use('/home', root);
router.use('/', root);

// frontend react router mappings should map to root
router.use('/category', root);

module.exports = router;