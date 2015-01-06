var express = require('express');
var router = express.Router();
var controller = require('../../controllers/eve/key-controller');

/* GET home page. */
router.get('/validate/batch/:count', controller.validateBatch);

module.exports = router;
