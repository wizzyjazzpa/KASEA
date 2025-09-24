const express = require('express');
const router = express.Router();
const api_controller = require('../controller/api_controller');


router.post('/savewallet',api_controller.savewallet);
router.post('/saveUserInfo',api_controller.saveUserInfo);
router.post('/getUserInfo/:walletAddress',api_controller.getUserInfo)









module.exports = router;