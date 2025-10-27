const express = require('express');
const router = express.Router();
const controll_pages =require('../controller/controll_pages');
const verify_token = require('../middleware/verify_admin_token');


router.get('/',controll_pages.home);
router.get('/staking',controll_pages.staking);
router.get('/howtobuy',controll_pages.howtobuy);
router.get('/token',controll_pages.token);
router.get('/wallectconnect',controll_pages.walletconnect);
router.get('/walletmodal',controll_pages.walletModal)
router.get('/admin_login',controll_pages.admin_login);
router.get('/admin_home',verify_token,controll_pages.admin_home);
router.get('/tokenfiles',verify_token,controll_pages.tokenfiles);
router.get('/changePassword',verify_token,controll_pages.ChangePasseord);

module.exports =router;