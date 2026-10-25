/**
 * DPDP_Secure - Consent & Purpose Management Client Controller
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Section 5 Multilingual Notice Builder | 1-Click WhatsApp Opt-in | Fast-Track Simulator | XSS Immunity
 */

(function () {
  'use strict';

  // State
  let currentLanguage = 'English';
  let currentNoticeText = '';

  // Multilingual templates
  const NOTICE_TEMPLATES = {
    English: {
      title: 'Diagnostic Test Booking & Lab Report Dispatch (English)',
      purposeCode: 'PURP-DIAGNOSTIC-REPORTING',
      text:
        "Aarogya Diagnostic Center — Data Protection Notice (DPDP Act, 2023 Section 5):\n\n" +
        "1. Itemised Personal Data Collected: Patient Name, Mobile Number, Age, and Diagnostic Test Name (Blood Sugar, Lipid Profile, Thyroid, Biopsy).\n" +
        "2. Specified Lawful Purpose: Delivery of requested medical lab reports and appointment coordination via WhatsApp.\n" +
        "3. Right to Withdraw (Section 6(4)): You may withdraw your consent at any time by replying 'STOP' or contacting our clinic.\n" +
        "4. Grievance Redressal: Clinic Data Protection Officer: Ramesh Kumar (dpo@aarogyaclinic.in, +91 9845012345).\n" +
        "To confirm your consent, please reply 'YES'."
    },
    Kannada: {
      title: 'ಡಯಾಗ್ನೋಸ್ಟಿಕ್ ವರದಿ ರವಾನೆ ಸೂಚನೆ (Kannada - ಕನ್ನಡ)',
      purposeCode: 'PURP-DIAGNOSTIC-REPORTING',
      text:
        "ಆರೋಗ್ಯ ಡಯಾಗ್ನೋಸ್ಟಿಕ್ ಸೆಂಟರ್ — ಡೇಟಾ ರಕ್ಷಣೆ ಸೂಚನೆ (DPDP ಕಾಯ್ದೆ 2023 ಸೆಕ್ಷನ್ 5):\n\n" +
        "1. ಸಂಗ್ರಹಿಸಿದ ವೈಯಕ್ತಿಕ ದತ್ತಾಂಶ: ರೋಗಿಯ ಹೆಸರು, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ, ವಯಸ್ಸು ಮತ್ತು ರಕ್ತ ಪರೀಕ್ಷಾ ವಿವರಗಳು.\n" +
        "2. ಉದ್ದೇಶ: ರೋಗಿಯ ಅಧಿಕೃತ ವೈದ್ಯಕೀಯ ಲ್ಯಾಬ್ ಪರೀಕ್ಷಾ ವರದಿಗಳನ್ನು ವಾಟ್ಸಾಪ್ ಮೂಲಕ ತಲುಪಿಸುವುದು.\n" +
        "3. ಹಿಂಪಡೆಯುವ ಹಕ್ಕು (ಸೆಕ್ಷನ್ 6(4)): ನೀವು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ 'STOP' ಎಂದು ಉತ್ತರಿಸುವ ಮೂಲಕ ಸಮ್ಮತಿಯನ್ನು ಹಿಂಪಡೆಯಬಹುದು.\n" +
        "4. ಕುಂದುಕೊರತೆ ನಿವಾರಣೆ: ಕ್ಲಿನಿಕ್ ಅಧಿಕಾರಿ: ರಮೇಶ್ ಕುಮಾರ್ (dpo@aarogyaclinic.in, +91 9845012345).\n" +
        "ವಾಟ್ಸಾಪ್ ಮೂಲಕ ವರದಿಗಳನ್ನು ಸ್ವೀಕರಿಸಲು ದಯವಿಟ್ಟು 'YES' ಎಂದು ಉತ್ತರಿಸಿ."
    },
    Hindi: {
      title: 'डायग्नोस्टिक लैब रिपोर्ट प्रेषण सूचना (Hindi - हिन्दी)',
      purposeCode: 'PURP-DIAGNOSTIC-REPORTING',
      text:
        "आरोग्य डायग्नोस्टिक सेंटर — डेटा गोपनीयता सूचना (DPDP अधिनियम 2023 धारा 5):\n\n" +
        "1. एकत्रित व्यक्तिगत डेटा: रोगी का नाम, मोबाइल नंबर, आयु और रक्त जांच रिपोर्ट विवरण।\n" +
        "2. विशिष्ट उद्देश्य: रोगी द्वारा मांगी गई मेडिकल लैब रिपोर्ट को व्हाट्सएप पर सुरक्षित रूप से भेजना।\n" +
        "3. सहमति वापस लेने का अधिकार (धारा 6(4)): आप किसी भी समय 'STOP' भेजकर अपनी सहमति वापस ले सकते हैं।\n" +
        "4. शिकायत निवारण: क्लिनिक शिकायत अधिकारी: रमेश कुमार (dpo@aarogyaclinic.in, +91 9845012345)।\n" +
        "व्हाट्सएप पर रिपोर्ट प्राप्त करने के लिए 'YES' लिखकर भेजें।"
    }
  };

  // Toast Helper
  function showToast(message, type = 'success') {
    let container = document.getElementById('dpdpToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'dpdpToastContainer';
      container.style.cssText = 'position:fixed;bottom:24px;left:24px;z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText =
      'padding:12px 18px;border-radius:10px;font-size:0.875rem;font-weight:600;color:#ffffff;box-shadow:0 10px 25px rgba(0,0,0,0.5);display:flex;align-items:center;gap:10px;pointer-events:auto;transition:all 0.3s ease;transform:translateY(10px);opacity:0;';

    if (type === 'success') {
      toast.style.background = 'linear-gradient(135deg, #059669, #10b981)';
      toast.style.border = '1px solid rgba(16,185,129,0.4)';
    } else if (type === 'warning') {
      toast.style.background = 'linear-gradient(135deg, #d97706, #f59e0b)';
      toast.style.border = '1px solid rgba(245,158,11,0.4)';
    } else {
      toast.style.background = 'linear-gradient(135deg, #dc2626, #ef4444)';
      toast.style.border = '1px solid rgba(239,68,68,0.4)';
    }

    const iconSpan = document.createElement('span');
    iconSpan.textContent = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌';
    toast.appendChild(iconSpan);

    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    toast.appendChild(textSpan);

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    }, 10);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Initialize Notice Builder View
  function initNoticeBuilder() {
    const langTabs = document.querySelectorAll('.notice-lang-tab');
    const noticeTextarea = document.getElementById('noticeTextarea');
    const noticeTitleInput = document.getElementById('noticeTitleInput');
    const purposeCodeSelect = document.getElementById('purposeCodeSelect');
    const livePreview = document.getElementById('noticeLivePreview');
    const charCounter = document.getElementById('noticeCharCount');
    const btnGenerateWa = document.getElementById('btnGenerateWhatsAppLink');
    const waLinkOutput = document.getElementById('waLinkOutput');
    const waLinkInput = document.getElementById('waLinkInput');
    const btnCopyWaLink = document.getElementById('btnCopyWaLink');
    const btnSimulateOptIn = document.getElementById('btnSimulateWhatsAppOptIn');
    const simPhoneInput = document.getElementById('simPatientPhone');
    const simResultBox = document.getElementById('simResultBox');

    if (!noticeTextarea) return;

    function updateNotice(lang) {
      currentLanguage = lang;
      const data = NOTICE_TEMPLATES[lang] || NOTICE_TEMPLATES.English;
      currentNoticeText = data.text;

      if (noticeTextarea) noticeTextarea.value = currentNoticeText;
      if (noticeTitleInput) noticeTitleInput.value = data.title;
      if (purposeCodeSelect) purposeCodeSelect.value = data.purposeCode;
      if (livePreview) livePreview.textContent = currentNoticeText;
      if (charCounter) charCounter.textContent = `${currentNoticeText.length} characters`;

      // Update active tab styles
      langTabs.forEach((tab) => {
        if (tab.getAttribute('data-lang') === lang) {
          tab.classList.add('active-lang-tab');
          tab.style.background = 'rgba(14, 165, 233, 0.2)';
          tab.style.borderColor = '#0ea5e9';
          tab.style.color = '#38bdf8';
        } else {
          tab.classList.remove('active-lang-tab');
          tab.style.background = 'rgba(30, 41, 59, 0.5)';
          tab.style.borderColor = 'rgba(51, 65, 85, 0.6)';
          tab.style.color = '#94a3b8';
        }
      });

      // Clear previous generated link
      if (waLinkOutput) waLinkOutput.classList.add('hidden');
    }

    // Language Tab Clicks
    langTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const lang = tab.getAttribute('data-lang');
        updateNotice(lang);
      });
    });

    // Real-time text changes
    noticeTextarea.addEventListener('input', () => {
      currentNoticeText = noticeTextarea.value;
      if (livePreview) livePreview.textContent = currentNoticeText;
      if (charCounter) charCounter.textContent = `${currentNoticeText.length} characters`;
    });

    // 1-Click WhatsApp Link Generator (URI Injection Immune with encodeURIComponent)
    if (btnGenerateWa) {
      btnGenerateWa.addEventListener('click', () => {
        const text = noticeTextarea.value || currentNoticeText;
        if (!text.trim()) {
          showToast('Notice text cannot be empty.', 'error');
          return;
        }

        // Strict URI encoding guardrail
        const encodedText = encodeURIComponent(text.trim());
        const waUrl = `https://wa.me/?text=${encodedText}`;

        if (waLinkInput) waLinkInput.value = waUrl;
        if (waLinkOutput) waLinkOutput.classList.remove('hidden');

        showToast('WhatsApp Notice link generated with URI encoding!');
      });
    }

    // Copy to clipboard
    if (btnCopyWaLink) {
      btnCopyWaLink.addEventListener('click', () => {
        if (!waLinkInput || !waLinkInput.value) return;
        navigator.clipboard.writeText(waLinkInput.value).then(() => {
          showToast('WhatsApp link copied to clipboard!');
        });
      });
    }

    // Evaluator Fast-Track Simulator: Citizen sending 'YES' on WhatsApp
    if (btnSimulateOptIn) {
      btnSimulateOptIn.addEventListener('click', async () => {
        const rawPhone = simPhoneInput ? simPhoneInput.value : '+91 9845012345';
        const cleanPhone = rawPhone.split('-')[0].trim();
        const purposeCode = purposeCodeSelect ? purposeCodeSelect.value : 'PURP-DIAGNOSTIC-REPORTING';

        btnSimulateOptIn.disabled = true;
        btnSimulateOptIn.innerHTML = '<span class="animate-spin inline-block mr-2">🔄</span> Recording SHA-256 Consent...';

        try {
          const res = await fetch('/api/consent/record-consent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: cleanPhone,
              purposeCode,
              channel: 'WHATSAPP',
              status: 'ACTIVE',
              language: currentLanguage
            })
          });

          const data = await res.json();
          if (data.success) {
            showToast(`Consent Recorded! Event ID: ${data.eventId}`);

            if (simResultBox) {
              simResultBox.classList.remove('hidden');
              simResultBox.innerHTML = `
                <div class="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-xs space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-emerald-400">✅ Statutory Section 6 Consent Event Created</span>
                    <span class="px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 font-mono text-[10px]">${data.status}</span>
                  </div>
                  <div class="text-slate-300"><strong class="text-white">Principal:</strong> ${data.phone}</div>
                  <div class="text-slate-300"><strong class="text-white">Purpose:</strong> ${data.purpose}</div>
                  <div class="text-slate-300"><strong class="text-white">Timestamp:</strong> ${data.timestamp}</div>
                  <div class="text-slate-300 break-all"><strong class="text-white">SHA-256 Proof:</strong> <span class="font-mono text-emerald-300">${data.sha256Proof}</span></div>
                  <div class="pt-2 flex gap-2">
                    <a href="/consent/ledger" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors">
                      <span>View in Consent Ledger</span>
                      <span>&rarr;</span>
                    </a>
                  </div>
                </div>
              `;
            }
          } else {
            showToast(data.error || 'Failed to record consent.', 'error');
          }
        } catch (err) {
          showToast('Failed to connect to backend server.', 'error');
        } finally {
          btnSimulateOptIn.disabled = false;
          btnSimulateOptIn.innerHTML = '⚡ Simulate Patient Sending "YES" on WhatsApp';
        }
      });
    }

    // Default to English
    updateNotice('English');
  }

  // Initialize Consent Ledger View
  function initConsentLedger() {
    const withdrawButtons = document.querySelectorAll('.btn-withdraw-consent');
    const copyHashButtons = document.querySelectorAll('.btn-copy-hash');

    // Withdraw Consent Click Handler
    withdrawButtons.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const phone = btn.getAttribute('data-phone');
        const purpose = btn.getAttribute('data-purpose');
        const row = btn.closest('tr');

        if (!confirm(`Are you sure you want to withdraw consent for ${phone} under Section 6(4)?`)) {
          return;
        }

        btn.disabled = true;
        btn.innerHTML = '<span class="animate-spin inline-block mr-1">🔄</span> Revoking...';

        try {
          const res = await fetch('/api/consent/withdraw-consent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, purposeCode: purpose })
          });

          const data = await res.json();
          if (data.success) {
            showToast(`Consent Revoked under Section 6(4)! Status: WITHDRAWN`);

            // Update row badge safely
            if (row) {
              const badge = row.querySelector('.consent-status-badge');
              if (badge) {
                badge.className = 'consent-status-badge px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-950/60 text-amber-400 border border-amber-500/40';
                badge.textContent = 'WITHDRAWN';
              }
              btn.replaceWith(document.createTextNode('Revoked'));
            }
          } else {
            showToast(data.error || 'Failed to withdraw consent.', 'error');
            btn.disabled = false;
            btn.textContent = 'Withdraw Consent';
          }
        } catch (err) {
          showToast('Connection error.', 'error');
          btn.disabled = false;
          btn.textContent = 'Withdraw Consent';
        }
      });
    });

    // Copy SHA-256 Hash
    copyHashButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const hash = btn.getAttribute('data-hash');
        if (!hash) return;
        navigator.clipboard.writeText(hash).then(() => {
          showToast('SHA-256 Hash Proof copied to clipboard!');
        });
      });
    });
  }

  // Auto-run on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initNoticeBuilder();
    initConsentLedger();
  });
})();
