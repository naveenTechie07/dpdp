import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_deck(output_path):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # Blank slide

    # Color Palette - Professional Deep Navy / Tech Gold / Slate
    BG_DARK = RGBColor(15, 23, 42)      # Slate 900
    BG_CARD = RGBColor(30, 41, 59)      # Slate 800
    TEXT_LIGHT = RGBColor(248, 250, 252) # Slate 50
    TEXT_MUTED = RGBColor(148, 163, 184) # Slate 400
    ACCENT_BLUE = RGBColor(56, 189, 248) # Sky 400
    ACCENT_GREEN = RGBColor(52, 211, 153) # Emerald 400
    ACCENT_AMBER = RGBColor(251, 191, 36) # Amber 400
    ACCENT_RED = RGBColor(248, 113, 113)  # Red 400
    BORDER_COLOR = RGBColor(51, 65, 85) # Slate 700

    def add_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.color.rgb = BG_DARK
        return bg

    def add_header(slide, title, category="SRUJANA TECH FEST 2026 | ROUND 1 EVALUATION"):
        # Category / Eyebrow
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.4))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = ACCENT_AMBER

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.8))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_LIGHT

    def add_card(slide, left, top, width, height, title="", title_color=ACCENT_BLUE):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = BG_CARD
        card.line.color.rgb = BORDER_COLOR
        card.line.width = Pt(1)

        if title:
            tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), width - Inches(0.4), Inches(0.5))
            tf = tb.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = title
            p.font.size = Pt(16)
            p.font.bold = True
            p.font.color.rgb = title_color
        return card

    # =========================================================
    # SLIDE 1: Title / Hero Slide
    # =========================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1)

    # Accent badge
    badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.2), Inches(4.5), Inches(0.45))
    badge.fill.solid()
    badge.fill.fore_color.rgb = RGBColor(30, 58, 138)
    badge.line.color.rgb = ACCENT_BLUE
    tf_b = badge.text_frame
    p_b = tf_b.paragraphs[0]
    p_b.text = "SRUJANA TECH FEST 2026 | 48-HR HACKATHON"
    p_b.font.size = Pt(11)
    p_b.font.bold = True
    p_b.font.color.rgb = ACCENT_BLUE
    p_b.alignment = PP_ALIGN.CENTER

    # Main Project Title
    t_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.7), Inches(2.0))
    tf = t_box.text_frame
    tf.word_wrap = True
    p1 = tf.paragraphs[0]
    p1.text = "DPDPA for Small Business"
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_LIGHT

    p2 = tf.add_paragraph()
    p2.text = "Practical Data Protection Compliance for Informal Indian SME Systems"
    p2.font.size = Pt(20)
    p2.font.color.rgb = ACCENT_AMBER
    p2.space_before = Pt(8)

    # Info Grid Cards at Bottom
    c1 = add_card(s1, Inches(0.8), Inches(4.3), Inches(3.6), Inches(2.4), "Problem Statement", ACCENT_BLUE)
    tb1 = s1.shapes.add_textbox(Inches(1.0), Inches(4.9), Inches(3.2), Inches(1.6))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    tf1.paragraphs[0].text = "• Track: Legal Services\n• ID: LS-04 (Personal Data in Informal Systems)\n• Context: DPDP Act, 2023 applicability to SMEs"
    tf1.paragraphs[0].font.size = Pt(13)
    tf1.paragraphs[0].font.color.rgb = TEXT_LIGHT

    c2 = add_card(s1, Inches(4.8), Inches(4.3), Inches(3.6), Inches(2.4), "Core Innovation", ACCENT_GREEN)
    tb2 = s1.shapes.add_textbox(Inches(5.0), Inches(4.9), Inches(3.2), Inches(1.6))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    tf2.paragraphs[0].text = "• 100% Offline-First Local Engine\n• Zero Cloud Data Leaks\n• Scans WhatsApp, Excel, CSVs\n• 15-Minute Zero-to-Compliant Flow"
    tf2.paragraphs[0].font.size = Pt(13)
    tf2.paragraphs[0].font.color.rgb = TEXT_LIGHT

    c3 = add_card(s1, Inches(8.8), Inches(4.3), Inches(3.7), Inches(2.4), "Round 1 Evaluation", ACCENT_AMBER)
    tb3 = s1.shapes.add_textbox(Inches(9.0), Inches(4.9), Inches(3.3), Inches(1.6))
    tf3 = tb3.text_frame
    tf3.word_wrap = True
    tf3.paragraphs[0].text = "• Checkpoint 1: 12-Hour Progress\n• Focus: Problem Scope & Domain Validity\n• Status: Core Algorithms & Models Verified\n• Tech Stack: React + FastAPI + openpyxl"
    tf3.paragraphs[0].font.size = Pt(13)
    tf3.paragraphs[0].font.color.rgb = TEXT_LIGHT

    # =========================================================
    # SLIDE 2: The Core Problem & Informal SME Reality
    # =========================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_bg(s2)
    add_header(s2, "The Problem: Why Indian SMEs are in Statutory Danger")

    card_s2_1 = add_card(s2, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0), "The Reality of Indian SME Data", ACCENT_AMBER)
    tb = s2.shapes.add_textbox(Inches(1.0), Inches(2.5), Inches(5.2), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True
    lines = [
        "63+ Million MSMEs in India process personal data digitally every day.",
        "Zero Centralized DBs: Data lives across WhatsApp chats, unencrypted Excel sheets, Google Forms, and billing tools.",
        "Prescriptions & IDs in Chats: Patients WhatsApp Aadhaar cards & health reports to reception phones.",
        "Formula Fragility: Deleting customer rows manually breaks Excel formulas (=SUM, =VLOOKUP) with #REF! errors.",
        "Zero In-House Legal/IT: Small businesses cannot hire Rs. 3 Lakh privacy consultants or pay $10,000 for OneTrust."
    ]
    for idx, l in enumerate(lines):
        p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
        p.text = "• " + l
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(10)

    card_s2_2 = add_card(s2, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0), "The DPDP Act 2023 Statutory Trap", ACCENT_RED)
    tb_r = s2.shapes.add_textbox(Inches(7.0), Inches(2.5), Inches(5.3), Inches(4.0))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True
    lines_r = [
        "NO Automatic SME Exemption: Under the statutory text, small businesses are full Data Fiduciaries.",
        "Crushing Penalties (Section 33):\n  - Up to Rs. 250 Crore for failing to secure personal data.\n  - Up to Rs. 200 Crore for failing to report data breaches.",
        "Section 5 Mandate: Must provide Itemised Notices in plain language across 22 constitutional languages.",
        "Section 8(6) Mandate: Mandatory breach notification to the Data Protection Board (DPBI) and affected users.",
        "The Result: A single misplaced staff phone or leaked spreadsheet can bankrupt the SME."
    ]
    for idx, l in enumerate(lines_r):
        p = tf_r.paragraphs[0] if idx == 0 else tf_r.add_paragraph()
        p.text = "⚠ " + l
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(10)

    # =========================================================
    # SLIDE 3: Persona & User Scenario
    # =========================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_bg(s3)
    add_header(s3, "Target Persona: Ramesh Kumar (Clinic Owner, Bengaluru)")

    c_p1 = add_card(s3, Inches(0.8), Inches(1.8), Inches(3.6), Inches(5.0), "The Persona Profile", ACCENT_BLUE)
    tbp1 = s3.shapes.add_textbox(Inches(1.0), Inches(2.5), Inches(3.2), Inches(4.0))
    tfp1 = tbp1.text_frame
    tfp1.word_wrap = True
    p = tfp1.paragraphs[0]
    p.text = "Ramesh Kumar\nManaging Partner"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_LIGHT
    
    pts = [
        "Entity: Aarogya Diagnostic Center",
        "Team: 14 staff, 1 doctor, 3 phlebotomists",
        "Scale: 6,200 patient records across 3 years",
        "Setup: 1 shared reception phone (WhatsApp) + 8 desktop Excel spreadsheets",
        "Pain: Terrified of DPDP penalties after hearing news; has zero IT budget"
    ]
    for pt in pts:
        p_sub = tfp1.add_paragraph()
        p_sub.text = "• " + pt
        p_sub.font.size = Pt(12)
        p_sub.font.color.rgb = TEXT_MUTED
        p_sub.space_before = Pt(8)

    c_p2 = add_card(s3, Inches(4.7), Inches(1.8), Inches(7.8), Inches(5.0), "15-Minute Zero-to-Compliant Journey", ACCENT_GREEN)
    tbp2 = s3.shapes.add_textbox(Inches(4.9), Inches(2.5), Inches(7.4), Inches(4.0))
    tfp2 = tbp2.text_frame
    tfp2.word_wrap = True
    steps = [
        ("Step 1: Local Scan (Minute 0–3)", "Ramesh selects his clinic folder. Scanner parses 3 Excel files and WhatsApp chat in 2.1 seconds, identifying 420 unencrypted Aadhaar numbers in plain text."),
        ("Step 2: Multilingual Notice (Minute 4–6)", "Generates a compliant Section 5 notice in Kannada & English with one click, giving reception a WhatsApp auto-reply template."),
        ("Step 3: One-Click Right to Erasure (Minute 7–10)", "When patient 'Priya' asks to be deleted, the engine redacts personal data without corrupting invoice totals (respecting the 6-year GST rule)."),
        ("Step 4: Breach Preparedness (Minute 11–15)", "Simulates a lost receptionist phone; auto-generates a ready-to-file Section 8(6) DPBI Dossier and calm customer SMS alerts.")
    ]
    for title, desc in steps:
        p_t = tfp2.paragraphs[0] if title == steps[0][0] else tfp2.add_paragraph()
        p_t.text = "✔ " + title
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = ACCENT_GREEN
        p_t.space_before = Pt(8)

        p_d = tfp2.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(12)
        p_d.font.color.rgb = TEXT_LIGHT

    # =========================================================
    # SLIDE 4: The 4-Pillar Solution Architecture
    # =========================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_bg(s4)
    add_header(s4, "The 4-Pillar Solution Architecture")

    # 4 Columns for 4 Pillars
    w = Inches(2.75)
    h = Inches(5.0)
    top_pos = Inches(1.8)

    # Pillar 1
    add_card(s4, Inches(0.8), top_pos, w, h, "Pillar 1: Discovery", ACCENT_BLUE)
    t1 = s4.shapes.add_textbox(Inches(0.95), top_pos + Inches(0.65), w - Inches(0.3), h - Inches(0.8))
    t1.text_frame.word_wrap = True
    p = t1.text_frame.paragraphs[0]
    p.text = "Local PII Scanner & RoPA Mapper"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = TEXT_LIGHT
    items1 = [
        "Ingests .xlsx, .csv, WhatsApp .txt, Google Forms",
        "Regex for Indian Phones & PAN (entity type verified)",
        "Aadhaar matching with Verhoeff Checksum verification",
        "Clinical keyword heuristics",
        "Generates interactive RoPA data map"
    ]
    for it in items1:
        p_sub = t1.text_frame.add_paragraph()
        p_sub.text = "• " + it
        p_sub.font.size = Pt(11)
        p_sub.font.color.rgb = TEXT_MUTED
        p_sub.space_before = Pt(6)

    # Pillar 2
    add_card(s4, Inches(3.8), top_pos, w, h, "Pillar 2: Consent", ACCENT_GREEN)
    t2 = s4.shapes.add_textbox(Inches(3.95), top_pos + Inches(0.65), w - Inches(0.3), h - Inches(0.8))
    t2.text_frame.word_wrap = True
    p = t2.text_frame.paragraphs[0]
    p.text = "Multilingual Notice & Ledger"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = TEXT_LIGHT
    items2 = [
        "Section 5 compliant notices in English, Hindi, Kannada",
        "Satisfies 8th Schedule constitutional requirement",
        "Affirmative Consent Ledger (WhatsApp 'YES', web, paper)",
        "Equal ease of withdrawal under Section 6(4)",
        "Purpose Expiry Sunset Alerter"
    ]
    for it in items2:
        p_sub = t2.text_frame.add_paragraph()
        p_sub.text = "• " + it
        p_sub.font.size = Pt(11)
        p_sub.font.color.rgb = TEXT_MUTED
        p_sub.space_before = Pt(6)

    # Pillar 3
    add_card(s4, Inches(6.8), top_pos, w, h, "Pillar 3: Rights (DSR)", ACCENT_AMBER)
    t3 = s4.shapes.add_textbox(Inches(6.95), top_pos + Inches(0.65), w - Inches(0.3), h - Inches(0.8))
    t3.text_frame.word_wrap = True
    p = t3.text_frame.paragraphs[0]
    p.text = "Atomic Redaction & Tax Resolver"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = TEXT_LIGHT
    items3 = [
        "Section 11 instant customer access summary",
        "In-place XML cell redaction preserving Excel formulas",
        "Statutory Conflict Resolver (DPDP Sec 8.7 vs CGST Sec 36)",
        "6-Year Tax Retention Lock for active invoices",
        "SHA-256 Erasure Certificate"
    ]
    for it in items3:
        p_sub = t3.text_frame.add_paragraph()
        p_sub.text = "• " + it
        p_sub.font.size = Pt(11)
        p_sub.font.color.rgb = TEXT_MUTED
        p_sub.space_before = Pt(6)

    # Pillar 4
    add_card(s4, Inches(9.8), top_pos, w, h, "Pillar 4: Breach", ACCENT_RED)
    t4 = s4.shapes.add_textbox(Inches(9.95), top_pos + Inches(0.65), w - Inches(0.3), h - Inches(0.8))
    t4.text_frame.word_wrap = True
    p = t4.text_frame.paragraphs[0]
    p.text = "5-Min DPBI Dossier Wizard"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = TEXT_LIGHT
    items4 = [
        "Rapid incident triage wizard (Lost phone, leaked link)",
        "Official Section 8(6) DPBI statutory filing dossier",
        "Transparent, calm customer SMS & WhatsApp alerts",
        "Containment checklist to stop ongoing exposure",
        "Defends against Rs. 200 Cr penalties"
    ]
    for it in items4:
        p_sub = t4.text_frame.add_paragraph()
        p_sub.text = "• " + it
        p_sub.font.size = Pt(11)
        p_sub.font.color.rgb = TEXT_MUTED
        p_sub.space_before = Pt(6)

    # =========================================================
    # SLIDE 5: Deep Domain Feature: Tax vs. Privacy Conflict Resolver
    # =========================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_bg(s5)
    add_header(s5, "Domain Masterstroke: The Statutory Conflict Resolver")

    card_d1 = add_card(s5, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0), "The Legal Contradiction", ACCENT_RED)
    tb_d1 = s5.shapes.add_textbox(Inches(1.0), Inches(2.5), Inches(5.2), Inches(4.0))
    tf_d1 = tb_d1.text_frame
    tf_d1.word_wrap = True
    d_pts = [
        "DPDP Act Section 8(7) & 12(2):\nMandates the erasure of personal data upon consent withdrawal or purpose completion.",
        "CGST Act Section 36 & Income Tax Act:\nMandates the retention of books of account and invoices for a minimum of 72 months (6 to 8 years).",
        "The Small Business Dilemma:\nIf the SME deletes the invoice upon customer demand, tax officers impose penalties for destroyed records. If they keep it, the DPBI fines them for violating the right to erasure."
    ]
    for idx, dp in enumerate(d_pts):
        p = tf_d1.paragraphs[0] if idx == 0 else tf_d1.add_paragraph()
        p.text = "⚖ " + dp
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    card_d2 = add_card(s5, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0), "Our Automated Resolution Engine", ACCENT_GREEN)
    tb_d2 = s5.shapes.add_textbox(Inches(7.0), Inches(2.5), Inches(5.3), Inches(4.0))
    tf_d2 = tb_d2.text_frame
    tf_d2.word_wrap = True
    res_pts = [
        "Automated Age Evaluation:\nThe engine checks the invoice date dynamically against statutory thresholds.",
        "Invoices < 6 Years Old (Tax Retention Lock):\nFinancial totals, invoice numbers, and GSTIN are locked for audit defense. Secondary marketing tags, browsing history, and chat logs are erased immediately.",
        "Invoices > 6 Years Old:\nStatutory period has lapsed; 100% full purge executed.",
        "Legal Evidence Dossier:\nIssues a cryptographically signed 'Statutory Retention Certificate' citing CGST Section 36 to satisfy both the customer and the DPBI."
    ]
    for idx, rp in enumerate(res_pts):
        p = tf_d2.paragraphs[0] if idx == 0 else tf_d2.add_paragraph()
        p.text = "✔ " + rp
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(10)

    # =========================================================
    # SLIDE 6: Technology Stack & Offline-First Advantage
    # =========================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_bg(s6)
    add_header(s6, "Technology Stack & The Offline-First Advantage")

    # Table of Tech Stack
    c_tech = add_card(s6, Inches(0.8), Inches(1.8), Inches(7.0), Inches(5.0), "Component Architecture", ACCENT_BLUE)
    tb_tech = s6.shapes.add_textbox(Inches(1.0), Inches(2.5), Inches(6.6), Inches(4.0))
    tf_tech = tb_tech.text_frame
    tf_tech.word_wrap = True
    tech_rows = [
        ("Frontend UI", "React (Vite) + Tailwind CSS", "Component-driven, responsive, stateful RoPA data tables with instant UI rendering."),
        ("Backend API", "Python 3.11+ / FastAPI", "Asynchronous, lightweight, self-documenting REST API endpoints."),
        ("Spreadsheet Engine", "openpyxl & pandas", "Direct XML node manipulation for Excel; preserves formula coordinates and formatting."),
        ("Pattern Engine", "Compiled re + Verhoeff", "Zero hallucinations; processes 10,000 spreadsheet rows in under 2 seconds."),
        ("Storage Layer", "Local SQLite", "Serverless, zero configuration, zero cloud footprint.")
    ]
    for layer, comp, why in tech_rows:
        p = tf_tech.paragraphs[0] if layer == tech_rows[0][0] else tf_tech.add_paragraph()
        p.text = f"• {layer} [{comp}]: {why}"
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(10)

    # Advantage Callout Card
    c_adv = add_card(s6, Inches(8.1), Inches(1.8), Inches(4.4), Inches(5.0), "Why 100% Offline Compute?", ACCENT_AMBER)
    tb_adv = s6.shapes.add_textbox(Inches(8.3), Inches(2.5), Inches(4.0), Inches(4.0))
    tf_adv = tb_adv.text_frame
    tf_adv.word_wrap = True
    adv_pts = [
        "Zero Cloud Data Leakage:\nUploading unencrypted SME files containing Aadhaar numbers and patient records to external cloud LLMs violates Section 8(5).",
        "Zero API Dependencies:\nNever fails during live judging due to spotty hackathon Wi-Fi or API rate limits.",
        "Zero Subscription Fees:\nSmall shopkeepers pay zero monthly cloud fees.",
        "Speed:\nProcesses 10,000 records in 1.8 seconds locally."
    ]
    for idx, ap in enumerate(adv_pts):
        p = tf_adv.paragraphs[0] if idx == 0 else tf_adv.add_paragraph()
        p.text = "🔒 " + ap
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(10)

    # =========================================================
    # SLIDE 7: Roadmap & Round 1 Evaluation Status
    # =========================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_bg(s7)
    add_header(s7, "48-Hour Implementation Plan & Round 1 Status")

    phases = [
        ("Hour 0–12: Round 1 Checkpoint (COMPLETED)", ACCENT_GREEN, [
            "Problem scope strictly defined on LS-04 (Informal Systems)",
            "Statutory mapping & CGST Act tax conflict mathematically modeled",
            "Core PII pattern engine + Verhoeff Aadhaar algorithm verified",
            "Synthetic realistic clinic datasets created (WhatsApp, CSV, Invoices)",
            "README.md & Round 1 Dossier live on GitHub"
        ]),
        ("Hour 12–24: Checkpoint 2 (NEXT SPRINT)", ACCENT_BLUE, [
            "FastAPI backend endpoints connected to local scanner",
            "openpyxl atomic redaction engine integrated",
            "Multilingual Section 5 notice builder operational (Kannada/Hindi/English)",
            "Affirmative Consent Ledger active"
        ]),
        ("Hour 24–36: Checkpoint 3 (DEMO VIDEO)", ACCENT_AMBER, [
            "React frontend dashboard connected to local backend",
            "End-to-end 15-minute user flow verified without crashes",
            "3-Minute Demo Video recorded and submitted (Hour 36 Deadline)"
        ]),
        ("Hour 36–48: Final Submission & Defense", ACCENT_GREEN, [
            "Edge-case testing across noisy WhatsApp chats & corrupted sheets",
            "Live presentation dry-runs & final code repository push",
            "Final Judging Round Q&A Defense"
        ])
    ]

    for idx, (p_title, col, bullets) in enumerate(phases):
        x = Inches(0.8) + idx * Inches(2.95)
        add_card(s7, x, Inches(1.8), Inches(2.8), Inches(5.0), p_title[:20] + "...", col)
        tb_ph = s7.shapes.add_textbox(x + Inches(0.15), Inches(2.4), Inches(2.5), Inches(4.2))
        tf_ph = tb_ph.text_frame
        tf_ph.word_wrap = True
        
        # Phase header
        p_head = tf_ph.paragraphs[0]
        p_head.text = p_title
        p_head.font.size = Pt(12)
        p_head.font.bold = True
        p_head.font.color.rgb = col
        p_head.space_after = Pt(8)

        for b in bullets:
            p_b = tf_ph.add_paragraph()
            p_b.text = "• " + b
            p_b.font.size = Pt(11)
            p_b.font.color.rgb = TEXT_LIGHT
            p_b.space_before = Pt(4)

    # =========================================================
    # SLIDE 8: Jury Q&A Defense Cheat Sheet (Winning Answers)
    # =========================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_bg(s8)
    add_header(s8, "Jury Defense Cheat Sheet: Hard Questions & Winning Answers")

    qas = [
        ("Q1: Why an offline local engine instead of calling cloud AI/LLMs?",
         "Uploading unencrypted customer spreadsheets containing Aadhaar numbers and patient diagnostic notes to external cloud LLMs violates Section 8(5). Our local engine ensures 100% data sovereignty, zero cloud fees, and executes in milliseconds."),
        ("Q2: What about the conflict between DPDP erasure and GST invoice retention?",
         "Section 8(7) of the DPDP Act mandates erasure EXCEPT where required by other laws. Section 36 of the CGST Act mandates 6 years of invoice retention. Our engine locks financial data for 6 years while wiping marketing tags, issuing a legally defensible Statutory Retention Certificate."),
        ("Q3: Does the DPDP Act even apply to small shops?",
         "Yes. Under the statute, there is NO blanket exemption for commercial SMEs. Every digital Data Fiduciary is liable, and security lapse penalties reach up to Rs. 250 Crore. Doing nothing is existential business risk."),
        ("Q4: How does redaction avoid breaking Excel formulas?",
         "We do not delete rows or shift cells. We modify the XML text node in place, replacing sensitive PII with [REDACTED_DPDP_SEC_12] while leaving coordinates, data types, and =SUM() / =VLOOKUP() formulas intact.")
    ]

    for idx, (q, a) in enumerate(qas):
        col_idx = idx % 2
        row_idx = idx // 2
        l = Inches(0.8) + col_idx * Inches(5.95)
        t = Inches(1.8) + row_idx * Inches(2.5)
        
        add_card(s8, l, t, Inches(5.7), Inches(2.35), "", ACCENT_BLUE)
        tb_q = s8.shapes.add_textbox(l + Inches(0.2), t + Inches(0.15), Inches(5.3), Inches(2.05))
        tf_q = tb_q.text_frame
        tf_q.word_wrap = True
        
        p_q = tf_q.paragraphs[0]
        p_q.text = q
        p_q.font.size = Pt(13)
        p_q.font.bold = True
        p_q.font.color.rgb = ACCENT_AMBER
        p_q.space_after = Pt(6)

        p_a = tf_q.add_paragraph()
        p_a.text = a
        p_a.font.size = Pt(11)
        p_a.font.color.rgb = TEXT_LIGHT

    prs.save(output_path)
    print(f"[SUCCESS] PowerPoint presentation saved to {output_path}")

if __name__ == "__main__":
    output_file = r"n:\chnayka\DPDPA_for_Small_Business_Round1_Presentation.pptx"
    if len(sys.argv) > 1:
        output_file = sys.argv[1]
    create_deck(output_file)
