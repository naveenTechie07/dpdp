/**
 * DPDP_Secure - Consent & Purpose Management Client Controller
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Section 5 Multilingual Notice Builder | 1-Click WhatsApp Opt-in | Fast-Track Simulator | XSS Immunity
 */

(function (window) {
  'use strict';

  // State
  let currentLanguage = 'English';
  let currentProfile = 'diagnostic';
  let currentNoticeText = '';

  // Multilingual Templates per Purpose Profile
  const PROFILES = {
    diagnostic: {
      name: 'Diagnostic Test Booking & Lab Report Dispatch',
      code: 'PURP-DIAGNOSTIC-REPORTING',
      templates: {
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
      }
    },
    retail: {
      name: 'Retail Order Processing & Home Delivery',
      code: 'PURP-RETAIL-DELIVERY',
      templates: {
        English: {
          title: 'Retail Order Processing & Home Delivery (English)',
          purposeCode: 'PURP-RETAIL-DELIVERY',
          text:
            "Aarogya Diagnostic Center — Retail & Home Sample Collection Notice (DPDP Act, 2023 Section 5):\n\n" +
            "1. Itemised Personal Data Collected: Customer Name, Delivery Address, Contact Number, Order ID.\n" +
            "2. Specified Purpose: Home pickup of diagnostic samples and dispatch of medical test kits.\n" +
            "3. Right to Withdraw (Section 6(4)): Reply 'STOP' at any time to cancel delivery notifications.\n" +
            "4. Grievance Contact: DPO Ramesh Kumar (dpo@aarogyaclinic.in).\n" +
            "To confirm home sample collection consent, reply 'YES'."
        },
        Kannada: {
          title: 'ಮನೆ ಬಾಗಿಲಿಗೆ ಮಾದರಿ ಸಂಗ್ರಹಣೆ ಸೂಚನೆ (Kannada - ಕನ್ನಡ)',
          purposeCode: 'PURP-RETAIL-DELIVERY',
          text:
            "ಆರೋಗ್ಯ ಡಯಾಗ್ನೋಸ್ಟಿಕ್ ಸೆಂಟರ್ — ಹೋಮ್ ಸ್ಯಾಂಪಲ್ ಪಿಕಪ್ ಡೇಟಾ ಸೂಚನೆ (DPDP ಕಾಯ್ದೆ 2023):\n\n" +
            "1. ಸಂಗ್ರಹಿಸಿದ ದತ್ತಾಂಶ: ಗ್ರಾಹಕರ ಹೆಸರು, ವಿಳಾಸ, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮತ್ತು ಆರ್ಡರ್ ವಿವರಗಳು.\n" +
            "2. ಉದ್ದೇಶ: ಮನೆ ಬಾಗಿಲಿಗೆ ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷಾ ಕಿಟ್‌ಗಳನ್ನು ತಲುಪಿಸುವುದು ಮತ್ತು ರಕ್ತದ ಮಾದರಿ ಸಂಗ್ರಹಿಸುವುದು.\n" +
            "3. ಸಮ್ಮತಿ ಹಿಂಪಡೆಯುವಿಕೆ: ರದ್ದುಗೊಳಿಸಲು 'STOP' ಎಂದು ಉತ್ತರಿಸಿ.\n" +
            "4. ಸಂಪರ್ಕ: ರಮೇಶ್ ಕುಮಾರ್ (dpo@aarogyaclinic.in).\n" +
            "ದೃಢೀಕರಿಸಲು 'YES' ಎಂದು ಉತ್ತರಿಸಿ."
        },
        Hindi: {
          title: 'होम सैंपल पिकअप एवं डिलीवरी सूचना (Hindi - हिन्दी)',
          purposeCode: 'PURP-RETAIL-DELIVERY',
          text:
            "आरोग्य डायग्नोस्टिक सेंटर — होम सैंपल एवं डिलीवरी सूचना (DPDP अधिनियम 2023):\n\n" +
            "1. एकत्रित डेटा: ग्राहक का नाम, पता, मोबाइल नंबर और ऑर्डर विवरण।\n" +
            "2. विशिष्ट उद्देश्य: घर से जांच सैंपल एकत्र करना और रिपोर्ट डिलीवरी समन्वय।\n" +
            "3. सहमति वापसी: किसी भी समय 'STOP' भेजें।\n" +
            "4. शिकायत अधिकारी: रमेश कुमार (dpo@aarogyaclinic.in)।\n" +
            "पुष्टि करने हेतु 'YES' लिखकर भेजें।"
        }
      }
    },
    tax: {
      name: 'Professional Tax Archival & Billing',
      code: 'PURP-STATUTORY-BILLING',
      templates: {
        English: {
          title: 'Professional Tax Archival & Billing (Section 8(7) Mandatory)',
          purposeCode: 'PURP-STATUTORY-BILLING',
          text:
            "Aarogya Diagnostic Center — Statutory Tax Archival Notice (DPDP Act, 2023):\n\n" +
            "1. Itemised Personal Data Collected: Patient Billing Name, PAN/GSTIN, Invoice Amount, and Payment Mode.\n" +
            "2. Lawful Basis: Statutory Mandatory Compliance under CGST Act Section 36 & DPDP Act Section 8(7).\n" +
            "3. Retention Mandate: Locked for 72 months (6 Financial Years) for tax auditing purposes.\n" +
            "4. Grievance Contact: Accounts & DPO Ramesh Kumar (dpo@aarogyaclinic.in).\n" +
            "Tax compliance records are locked by statute."
        },
        Kannada: {
          title: 'ತೆರಿಗೆ ಲೆಕ್ಕಪತ್ರ ಸಂಗ್ರಹಣೆ ಸೂಚನೆ (Statutory Tax Lock)',
          purposeCode: 'PURP-STATUTORY-BILLING',
          text:
            "ಆರೋಗ್ಯ ಡಯಾಗ್ನೋಸ್ಟಿಕ್ ಸೆಂಟರ್ — ಶಾಸನಬದ್ಧ ತೆರಿಗೆ ಮತ್ತು ಬಿಲ್ಲಿಂಗ್ ಸೂಚನೆ (DPDP ಕಾಯ್ದೆ 2023):\n\n" +
            "1. ದತ್ತಾಂಶ: ಬಿಲ್ಲಿಂಗ್ ಹೆಸರು, ಮೊತ್ತ, ಜಿಎಸ್‌ಟಿ ಸಂಖ್ಯೆ ಮತ್ತು ಪಾವತಿ ವಿವರಗಳು.\n" +
            "2. ಶಾಸನಬದ್ಧ ಆಧಾರ: ಸಿಜಿಎಸ್‌ಟಿ ಕಾಯ್ದೆ ಸೆಕ್ಷನ್ 36 ರ ಪ್ರಕಾರ 72 ತಿಂಗಳುಗಳ ಕಾಲ ಆಡಿಟ್‌ಗಾಗಿ ಲಾಕ್ ಮಾಡಲಾಗಿದೆ.\n" +
            "3. ಸಂಪರ್ಕ: ರಮೇಶ್ ಕುಮಾರ್ (dpo@aarogyaclinic.in)."
        },
        Hindi: {
          title: 'वैधानिक कर एवं बिलिंग सूचना (Statutory Tax Lock)',
          purposeCode: 'PURP-STATUTORY-BILLING',
          text:
            "आरोग्य डायग्नोस्टिक सेंटर — वैधानिक कर एवं बिलिंग रिकॉर्ड्स सूचना (DPDP अधिनियम 2023):\n\n" +
            "1. डेटा: बिलिंग नाम, चालान राशि, जीएसटी एवं भुगतान विवरण।\n" +
            "2. वैधानिक आधार: सीजीएसटी अधिनियम की धारा 36 एवं DPDP धारा 8(7) के अंतर्गत 72 माह (6 वर्ष) लॉक।\n" +
            "3. संपर्क: रमेश कुमार (dpo@aarogyaclinic.in)।"
        }
      }
    }
  };

  // Toast Helper
  function showToast(message, type = 'success') {
    let container = document.getElementById('dpdpToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'dpdpToastContainer';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText =
      'padding: 12px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 8px; pointer-events: auto; transition: all 0.3s ease; transform: translateY(10px); opacity: 0;';

    if (type === 'success') {
      toast.style.background = '#065f46';
      toast.style.border = '1px solid #10b981';
      toast.style.color = '#34d399';
    } else if (type === 'warning') {
      toast.style.background = '#78350f';
      toast.style.border = '1px solid #f59e0b';
      toast.style.color = '#fbbf24';
    } else {
      toast.style.background = '#7f1d1d';
      toast.style.border = '1px solid #ef4444';
      toast.style.color = '#f87171';
    }

    toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌'}</span> <span>${message}</span>`;
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

  // Update Notice in Editor & Live Preview
  function updateNoticeView(lang, profileKey) {
    if (lang) currentLanguage = lang;
    if (profileKey) currentProfile = profileKey;

    const profile = PROFILES[currentProfile] || PROFILES.diagnostic;
    const template = profile.templates[currentLanguage] || profile.templates.English;
    currentNoticeText = template.text;

    const textarea = document.getElementById('noticeTextarea');
    const titleInput = document.getElementById('noticeTitleInput');
    const purposeSelect = document.getElementById('purposeCodeSelect');
    const livePreview = document.getElementById('noticeLivePreview');
    const charCounter = document.getElementById('noticeCharCount');

    if (textarea) textarea.value = currentNoticeText;
    if (titleInput) titleInput.value = template.title;
    if (purposeSelect) purposeSelect.value = template.purposeCode;
    if (livePreview) livePreview.textContent = currentNoticeText;
    if (charCounter) charCounter.textContent = `${currentNoticeText.length} characters`;

    // Update Language Tab styles
    const tabs = {
      English: document.getElementById('tabLangEn'),
      Kannada: document.getElementById('tabLangKn'),
      Hindi: document.getElementById('tabLangHi')
    };

    Object.keys(tabs).forEach((l) => {
      const tab = tabs[l];
      if (!tab) return;
      if (l === currentLanguage) {
        tab.classList.add('active');
        tab.style.background = 'rgba(59, 130, 246, 0.2)';
        tab.style.borderColor = 'rgba(59, 130, 246, 0.4)';
        tab.style.color = '#60a5fa';
      } else {
        tab.classList.remove('active');
        tab.style.background = 'transparent';
        tab.style.borderColor = 'transparent';
        tab.style.color = 'var(--text-muted)';
      }
    });

    // Clear previous generated link
    const waLinkOutput = document.getElementById('waLinkOutput');
    if (waLinkOutput) waLinkOutput.style.display = 'none';
  }

  // Switch Language
  window.switchLanguage = function (lang) {
    updateNoticeView(lang, currentProfile);
  };

  // Switch Purpose Profile
  window.selectPurposeProfile = function (profileKey) {
    currentProfile = profileKey;

    const cards = {
      diagnostic: document.getElementById('profileCardDiagnostic'),
      retail: document.getElementById('profileCardRetail'),
      tax: document.getElementById('profileCardTax')
    };

    Object.keys(cards).forEach((k) => {
      const card = cards[k];
      if (!card) return;
      if (k === profileKey) {
        card.classList.add('active');
        card.style.background = 'rgba(16, 185, 129, 0.08)';
        card.style.borderColor = 'rgba(16, 185, 129, 0.6)';
        card.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.15)';
      } else {
        card.classList.remove('active');
        card.style.background = 'rgba(17, 24, 39, 0.7)';
        card.style.borderColor = 'var(--border-color)';
        card.style.boxShadow = 'none';
      }
    });

    updateNoticeView(currentLanguage, profileKey);
  };

  // Real-time Text Input
  window.handleNoticeTextInput = function () {
    const textarea = document.getElementById('noticeTextarea');
    const livePreview = document.getElementById('noticeLivePreview');
    const charCounter = document.getElementById('noticeCharCount');

    if (textarea) {
      currentNoticeText = textarea.value;
      if (livePreview) livePreview.textContent = currentNoticeText;
      if (charCounter) charCounter.textContent = `${currentNoticeText.length} characters`;
    }
  };

  // Handle Purpose Code Dropdown Change
  window.handlePurposeCodeChange = function () {
    const select = document.getElementById('purposeCodeSelect');
    if (!select) return;
    const val = select.value;
    if (val === 'PURP-DIAGNOSTIC-REPORTING') window.selectPurposeProfile('diagnostic');
    else if (val === 'PURP-RETAIL-DELIVERY') window.selectPurposeProfile('retail');
    else if (val === 'PURP-STATUTORY-BILLING') window.selectPurposeProfile('tax');
  };

  // Toggle Optional Marketing
  window.toggleOptionalMarketing = function () {
    const chk = document.getElementById('chkOptionalMarketing');
    const textarea = document.getElementById('noticeTextarea');
    if (!textarea) return;

    const marketingClause = "\nOptional Service: Reply 'PROMO' if you also wish to receive quarterly free health camp announcements.";
    let val = textarea.value;

    if (chk && chk.checked) {
      if (!val.includes(marketingClause)) {
        textarea.value = val + marketingClause;
      }
    } else {
      textarea.value = val.replace(marketingClause, '');
    }
    window.handleNoticeTextInput();
  };

  // 1-Click WhatsApp Notice Link Generator (Strict URI Injection Immunity)
  window.generateWhatsAppLink = function () {
    const textarea = document.getElementById('noticeTextarea');
    const text = textarea ? textarea.value : currentNoticeText;

    if (!text || !text.trim()) {
      showToast('Notice text cannot be empty.', 'error');
      return;
    }

    // Strict URL encoding
    const encodedText = encodeURIComponent(text.trim());
    const waUrl = `https://wa.me/?text=${encodedText}`;

    const linkInput = document.getElementById('waLinkInput');
    const linkOutput = document.getElementById('waLinkOutput');
    const webBtn = document.getElementById('btnOpenWhatsAppWeb');

    if (linkInput) linkInput.value = waUrl;
    if (webBtn) webBtn.href = waUrl;
    if (linkOutput) linkOutput.style.display = 'block';

    showToast('WhatsApp notice link generated with URI injection guardrails!');
  };

  // Copy WhatsApp Link
  window.copyWhatsAppLink = function () {
    const linkInput = document.getElementById('waLinkInput');
    if (!linkInput || !linkInput.value) return;

    navigator.clipboard.writeText(linkInput.value).then(() => {
      showToast('WhatsApp opt-in link copied to clipboard!');
    }).catch(() => {
      linkInput.select();
      document.execCommand('copy');
      showToast('Link copied to clipboard!');
    });
  };

  // Save Notice to Database
  window.saveNoticeToDatabase = async function () {
    const title = (document.getElementById('noticeTitleInput')?.value || '').trim();
    const purposeCode = document.getElementById('purposeCodeSelect')?.value || 'PURP-DIAGNOSTIC-REPORTING';
    const noticeText = (document.getElementById('noticeTextarea')?.value || '').trim();
    const btn = document.getElementById('btnSaveNotice');

    if (!title || !noticeText) {
      showToast('Title and notice text are required.', 'error');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" style="display:inline-block;width:12px;height:12px;border:2px solid white;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></span> Saving...';
    }

    try {
      const res = await fetch('/api/consent/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          title,
          purposeCode,
          language: currentLanguage,
          noticeText,
          version: '1.0'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Section 5 Notice Published! (ID: ${data.noticeId})`, 'success');
      } else {
        showToast(data.error || 'Failed to save notice.', 'error');
      }
    } catch (err) {
      showToast('Error connecting to notice API: ' + err.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> <span>Save / Publish Notice</span>';
      }
    }
  };

  // Fast-Track Simulation (Patient sending 'YES' on WhatsApp)
  window.runFastTrackSimulation = async function () {
    const rawPhone = document.getElementById('simPatientPhone')?.value || '+91 9845012345';
    const cleanPhone = rawPhone.split('-')[0].trim();
    const purposeCode = document.getElementById('purposeCodeSelect')?.value || 'PURP-DIAGNOSTIC-REPORTING';
    const btn = document.getElementById('btnSimulateWhatsAppOptIn');
    const resultBox = document.getElementById('simResultBox');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" style="display:inline-block;width:14px;height:14px;border:2px solid white;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></span> Recording SHA-256 Consent...';
    }

    try {
      const res = await fetch('/api/consent/record-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          purposeCode,
          channel: 'WHATSAPP',
          status: 'ACTIVE',
          language: currentLanguage
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Consent Recorded! Event: ${data.eventId}`);

        if (resultBox) {
          resultBox.style.display = 'block';
          resultBox.innerHTML = `
            <div style="background: rgba(6, 78, 59, 0.4); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 8px; padding: 12px 14px; font-size: 12px; display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: #34d399;">✅ Statutory Section 6 Consent Event Created</strong>
                <span class="badge" style="background: rgba(16, 185, 129, 0.3); color: #34d399; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">${data.status}</span>
              </div>
              <div style="color: #cbd5e1;"><strong>Data Principal:</strong> ${data.phone}</div>
              <div style="color: #cbd5e1;"><strong>Purpose:</strong> ${data.purpose}</div>
              <div style="color: #cbd5e1;"><strong>Timestamp:</strong> ${data.timestamp}</div>
              <div style="color: #cbd5e1; word-break: break-all;">
                <strong>SHA-256 Proof:</strong>
                <span style="font-family: monospace; color: #6ee7b7;">${data.sha256Proof}</span>
              </div>
              <div style="margin-top: 6px; display: flex; gap: 8px;">
                <a href="/consent/ledger" style="display: inline-flex; align-items: center; gap: 4px; background: #059669; color: white; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none;">
                  <span>View in Consent Ledger &rarr;</span>
                </a>
              </div>
            </div>
          `;
        }
      } else {
        showToast(data.error || 'Failed to record consent.', 'error');
      }
    } catch (err) {
      showToast('Network error while simulating consent.', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>⚡ Simulate Patient Sending "YES" on WhatsApp</span>';
      }
    }
  };

  // Handle Collection Point Form Submission
  window.handleCollectionPointSubmit = async function (e) {
    if (e && e.preventDefault) e.preventDefault();

    const channelName = document.getElementById('cpChannelName')?.value?.trim();
    const channelType = document.getElementById('cpChannelType')?.value;
    const purposeCode = document.getElementById('cpPurposeCode')?.value;
    const supportedLanguages = document.getElementById('cpLanguages')?.value?.trim();
    const statutoryBasis = document.getElementById('cpStatutoryBasis')?.value?.trim();
    const btn = document.getElementById('btnSaveCollectionPoint');

    if (!channelName) {
      alert('Channel name is required.');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Registering...';
    }

    try {
      const res = await fetch('/api/consent/collection-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          channelName,
          channelType,
          purposeCode,
          supportedLanguages,
          statutoryBasis,
          status: 'ENABLED'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Collection Channel "${channelName}" Published!`);
        appendCollectionPointRow(data.point);
        closeAddCollectionPointModal();
        document.getElementById('addCollectionPointForm')?.reset();
      } else {
        alert('Failed to register collection channel: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error connecting to server.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Register Channel';
      }
    }
  };

  // Append Collection Point Row to Table
  function appendCollectionPointRow(point) {
    const tbody = document.getElementById('collectionPointsTableBody');
    if (!tbody) return;

    let icon = '💬';
    if (point.channelType === 'WEB_FORM') icon = '🌐';
    else if (point.channelType === 'PHYSICAL_PAPER') icon = '📋';
    else if (point.channelType === 'MOBILE_APP') icon = '📱';
    else if (point.channelType === 'SMS') icon = '📩';

    const tr = document.createElement('tr');
    tr.id = `cp-row-${point.id}`;
    tr.style.borderBottom = '1px solid var(--border-color)';

    const langs = (point.supportedLanguages || 'English').split(',').map(l =>
      `<span class="badge" style="background: rgba(255,255,255,0.06); color: var(--text-muted); border: 1px solid var(--border-color); padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-right: 4px;">${l.trim()}</span>`
    ).join('');

    tr.innerHTML = `
      <td style="padding: 14px 20px; font-weight: 600; color: var(--text-main); white-space: nowrap;">
        <span style="margin-right: 6px;">${icon}</span>
        <span>${escapeHtml(point.channelName)}</span>
      </td>
      <td style="padding: 14px 20px; font-family: monospace; color: #60a5fa;">
        ${escapeHtml(point.purposeCode)}
      </td>
      <td style="padding: 14px 20px;">
        ${langs}
      </td>
      <td style="padding: 14px 20px; color: var(--text-muted);">
        ${escapeHtml(point.statutoryBasis || 'Section 6(1) Explicit Consent')}
      </td>
      <td style="padding: 14px 20px;">
        <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700;">
          ${escapeHtml(point.status || 'ENABLED')}
        </span>
      </td>
      <td style="padding: 14px 20px; text-align: right;">
        <a href="/consent/ledger" style="color: #60a5fa; text-decoration: none; font-weight: 600; font-size: 11px; margin-right: 12px;">
          View Ledger &rarr;
        </a>
        <button type="button" onclick="deleteCollectionPointChannel('${point.id}')" title="Delete Channel" style="background: transparent; border: none; color: #f87171; cursor: pointer; padding: 2px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `;
    tbody.prepend(tr);

    // Update Counter
    const counter = document.getElementById('metricCollectionChannels');
    if (counter) {
      const count = tbody.querySelectorAll('tr[id^="cp-row-"]').length;
      counter.textContent = count;
    }
  }

  // Delete Collection Point Channel
  window.deleteCollectionPointChannel = async function (id) {
    if (!confirm('Remove this collection point channel from published endpoints?')) return;

    try {
      const res = await fetch(`/api/consent/collection-points/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const row = document.getElementById(`cp-row-${id}`);
        if (row) row.remove();
        showToast('Collection channel removed.');
      } else {
        alert('Failed to delete channel: ' + (data.error || 'Server error'));
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Auto-run on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    updateNoticeView('English', 'diagnostic');
  });

})(window);
