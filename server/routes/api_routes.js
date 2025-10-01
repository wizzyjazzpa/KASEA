const express = require('express');
const router = express.Router();
const api_controller = require('../controller/api_controller');


//router.post('/savewallet',api_controller.savewallet);
router.post('/saveUserInfo',api_controller.saveUserInfo);
router.get('/getUserInfo/:walletAddress',api_controller.getUserInfo)
router.get('/phase',api_controller.phase);
router.get('/approvePayment/:wallet',api_controller.approvePayment);









module.exports = router;