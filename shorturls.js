// src/routes/shorturls.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { customAlphabet } = require('nanoid');
const Link = require('../models/Link');

const nano = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);
const DEFAULT_MIN = parseInt(process.env.DEFAULT_VALIDITY_MIN || '30', 10);

function looksLikeUrl(s) {
  try {
    const u = new URL(s);
    return ['http:', 'https:'].includes(u.protocol);
  } catch (e) {
    return false;
  }
}

/**
 * Create short URL
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { url, validity, shortcode } = req.body;
    const vMin = Number.isInteger(validity) && validity > 0 ? validity : DEFAULT_MIN;

    if (!url || !looksLikeUrl(url)) {
      return res.status(400).json({ error: 'invalid url' });
    }

    let code = null;
    if (shortcode) {
      if (!/^[0-9A-Za-z_-]{3,40}$/.test(shortcode)) {
        return res.status(400).json({ error: 'invalid shortcode format' });
      }
      code = shortcode;
      const exists = await Link.findOne({ code });
      if (exists) return res.status(409).json({ error: 'shortcode already in use' });
    } else {
      let tries = 0;
      do {
        code = nano();
        const found = await Link.findOne({ code });
        if (!found) break;
        tries++;
      } while (tries < 5);
      if (tries >= 5) code = code + '-' + nano();
    }

    const expireAt = new Date(Date.now() + vMin * 60 * 1000);

    const link = new Link({
      code,
      originalUrl: url,
      expireAt,
    });

    await link.save();

    return res.status(201).json({
      shortLink: `${process.env.HOSTNAME || 'http://localhost:4000'}/${code}`,
      expiry: expireAt.toISOString(),
    });
  })
);

/**
 * Redirect by code
 */
router.get(
  '/:code',
  asyncHandler(async (req, res) => {
    const { code } = req.params;
    const link = await Link.findOne({ code });
    if (!link) return res.status(404).json({ error: 'not found' });

    if (link.expireAt < new Date()) {
      return res.status(410).json({ error: 'link expired' });
    }

    link.hits = (link.hits || 0) + 1;
    link.lastAccessedAt = new Date();
    await link.save();

    return res.redirect(link.originalUrl);
  })
);

/**
 * Stats endpoint
 */
router.get(
  '/:code/stats',
  asyncHandler(async (req, res) => {
    const { code } = req.params;
    const link = await Link.findOne({ code }).select(
      '-_id code originalUrl createdAt expireAt hits lastAccessedAt'
    );
    if (!link) return res.status(404).json({ error: 'not found' });
    return res.json({ data: link });
  })
);

module.exports = router;
