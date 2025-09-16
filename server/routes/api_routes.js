const express = require('express');
const router = express.Router();
const api_controller = require('../controller/api_controller');


router.post('/savewallet',api_controller.savewallet);









module.exports = router;