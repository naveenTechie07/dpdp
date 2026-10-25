/**
 * DPDP_Secure - AI & LLM Integration Routes
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Dedicated rate limiter (max 20 calls/min/IP) | Multi-provider AI controller
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const aiAssistantController = require('../controllers/aiAssistantController');

// Dedicated AI Endpoint Rate Limiter: Max 20 calls per minute per IP
const aiEndpointLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 20, // Max 20 calls per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'AI assistant rate limit exceeded. Please wait 1 minute before sending more queries.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Apply rate limiter to all /api/ai/ endpoints
router.use('/api/ai', aiEndpointLimiter);

/**
 * @route   POST /api/ai/chat
 * @desc    Handles interactive queries from the floating SME Privacy Assistant
 * @access  Public / Authenticated
 */
router.post('/api/ai/chat', aiAssistantController.chat);

/**
 * @route   POST /api/ai/translate-notice
 * @desc    Translates Section 5 notice text into Kannada or Hindi with statutory terms
 * @access  Public / Authenticated
 */
router.post('/api/ai/translate-notice', aiAssistantController.translateNotice);

/**
 * @route   POST /api/ai/assess-breach
 * @desc    Evaluates incident description and computes breach risk tier under Rule 7
 * @access  Public / Authenticated
 */
router.post('/api/ai/assess-breach', aiAssistantController.assessBreach);

/**
 * @route   GET /api/ai/status
 * @desc    Returns active AI provider and operational readiness
 * @access  Public
 */
router.get('/api/ai/status', aiAssistantController.getStatus);

module.exports = router;
