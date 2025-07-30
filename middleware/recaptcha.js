const axios = require('axios');

const verifyRecaptcha = async (req, res, next) => {
    const recaptchaToken = req.body['g-recaptcha-response'];
    console.log(recaptchaToken)

    if (!recaptchaToken) {
        return res.status(400).json({ success: false, message: 'reCAPTCHA token is required.' });
    }

    try {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}&remoteip=${req.ip}`;
        const response = await axios.post(verificationURL);
        if (response.data.success) {
            next();
        } else {
            return res.status(400).json({
                success: false,
                message: 'Failed reCAPTCHA verification.',
                'error-codes': response.data['error-codes'] || []
            });
        }
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return res.status(500).json({ success: false, message: 'Server error during reCAPTCHA verification.' });
    }
};

module.exports = verifyRecaptcha;