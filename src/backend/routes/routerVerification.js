const express = require('express');
const {
    generateVerificationCodeForUser,
    getVerificationExpiration,
    verifyCode,
    resendVerificationCode,
    resendForgotPasswordCode,
    verifyForgotPasswordCode,
    generateResetPasswordCode,
    getverificationexpiration,
    getforgotpasswordexpiration
} = require('../controllers/verificationController');

const router = express.Router();

router.post('/generate/:userId', generateVerificationCodeForUser);
router.post('/generate/reset/:userId', generateResetPasswordCode);
router.get('/verification-expiration/:userID', getVerificationExpiration);
router.post('/verify', verifyCode);
router.post('/resend-verification-code', resendVerificationCode);
router.post('/resend-forgot-password-code', resendForgotPasswordCode);
router.post('/verify-forgot-password', verifyForgotPasswordCode);

router.get('/get-verification-expiration', getverificationexpiration);
router.get('/get-forgot-password-expiration', getforgotpasswordexpiration );

module.exports = router;
