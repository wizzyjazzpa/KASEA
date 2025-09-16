const express = require('express');
const router = express.Router();
const controll_pages =require('../controller/controll_pages');


router.get('/',controll_pages.home);
router.get('/staking',controll_pages.staking);
router.get('/howtobuy',controll_pages.howtobuy);
router.get('/token',controll_pages.token);
router.get('/wallectconnect',controll_pages.walletconnect);

module.exports =router;