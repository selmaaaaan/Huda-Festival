const express = require('express');
const router = express.Router({ mergeParams: true});
const {
    generateCertificate,
} = require('../controllers/certificateController');

router.route('/')
    .get(generateCertificate);

module.exports = router;