'use strict';

var express = require('express');
var controller = require('./crawl.data.server.controller');

var router = express.Router();

router.param('id', controller.storedId);

router.get('/:id', controller.query);
router.put('/:id', controller.update);

module.exports = router;