const express = require('express');
const {
    generateVerificationCodeForUser,
    getVerificationExpiration,
    verifyCode,
    resendVerificationCode,
    resendForgotPasswordCode,
    verifyForgotPasswordCode,
    generateResetPasswordCode
} = require('../controllers/verificationController');

const router = express.Router();

router.post('/generate/:userId', generateVerificationCodeForUser);
router.post('/generate/reset/:userId', generateResetPasswordCode);
router.get('/verification-expiration/:userID', getVerificationExpiration);
router.post('/verify', verifyCode);
router.post('/resend-verification-code', resendVerificationCode);
router.post('/resend-forgot-password-code', resendForgotPasswordCode);
router.post('/verify-forgot-password', verifyForgotPasswordCode);

module.exports = router;
