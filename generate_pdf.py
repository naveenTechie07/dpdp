#!/usr/bin/env python3
"""Generate a modern, professional PDF report from the markdown source."""

import markdown
from weasyprint import HTML

# Read the markdown source
with open("PROJECT_REPORT.md", "r", encoding="utf-8") as f:
    md_content = f.read()

# Convert markdown to HTML
md = markdown.Markdown(
    extensions=[
        "extra",
        "codehilite",
        "tables",
        "toc",
        "fenced_code",
        "attr_list",
    ],
    extension_configs={
        "codehilite": {"css_class": "highlight", "guess_lang": False},
        "toc": {"permalink": True, "title": "Table of Contents"},
    },
)
body_html = md.convert(md_content)
toc_html = md.toc

# Modern CSS for a professional hackathon report
css = """
@page {
    size: A4;
    margin: 20mm 18mm 22mm 18mm;
    @top-center {
        content: "Srujana (DataSentinel) — DPDP Act 2023 Compliance Report";
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 7.5pt;
        color: #64748b;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 4px;
        margin-bottom: 8px;
        width: 100%;
    }
    @bottom-center {
        content: "Page " counter(page) " of " counter(pages);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 8pt;
        color: #94a3b8;
    }
    @bottom-left {
        content: "LS-04 | Srujana Tech Fest 2026";
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 7.5pt;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }
}

@page cover {
    margin: 0;
    @top-center { content: none; }
    @bottom-center { content: none; }
    @bottom-left { content: none; }
}

* {
    box-sizing: border-box;
}

html {
    font-size: 10.5pt;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #1e293b;
    line-height: 1.6;
    font-size: 10.5pt;
}

h1, h2, h3, h4, h5, h6 {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #0f172a;
    font-weight: 700;
    line-height: 1.25;
    margin-top: 1.4em;
    margin-bottom: 0.6em;
}

h1 {
    font-size: 20pt;
    color: #0ea5e9;
    border-bottom: 3px solid #0ea5e9;
    padding-bottom: 10px;
    margin-bottom: 20px;
    letter-spacing: -0.5px;
}

h2 {
    font-size: 15pt;
    color: #0f172a;
    border-left: 4px solid #0ea5e9;
    padding-left: 14px;
    margin-top: 28px;
    margin-bottom: 14px;
    page-break-after: avoid;
}

h3 {
    font-size: 11.5pt;
    color: #334155;
    margin-top: 18px;
    margin-bottom: 8px;
    page-break-after: avoid;
}

p {
    margin-bottom: 10px;
    text-align: justify;
    orphans: 3;
    widows: 3;
}

a {
    color: #0ea5e9;
    text-decoration: none;
    border-bottom: 1px solid rgba(14, 165, 233, 0.3);
}

a:hover {
    color: #0284c7;
}

/* Cover Page */
.cover {
    page: cover;
    height: 297mm;
    width: 210mm;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
    color: #ffffff;
    padding: 0;
    position: relative;
    overflow: hidden;
}

.cover-content {
    padding: 40mm 25mm 0 25mm;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.cover-badge {
    display: inline-block;
    background: rgba(14, 165, 233, 0.15);
    border: 1px solid rgba(14, 165, 233, 0.4);
    color: #38bdf8;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 9pt;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 30px;
}

.cover h1 {
    font-size: 34pt;
    color: #ffffff;
    border: none;
    margin: 0;
    line-height: 1.1;
    letter-spacing: -1px;
}

.cover-subtitle {
    font-size: 13pt;
    color: #94a3b8;
    margin-top: 14px;
    margin-bottom: 40px;
    line-height: 1.5;
}

.cover-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.4), transparent);
    margin: 30px 0;
}

.cover-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px 30px;
    margin-bottom: 40px;
}

.cover-meta-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 14px 18px;
}

.cover-meta-label {
    font-size: 7.5pt;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
    display: block;
}

.cover-meta-value {
    font-size: 10pt;
    color: #e2e8f0;
    font-weight: 500;
}

.cover-footer {
    padding-bottom: 20mm;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 20px;
}

.cover-footer-text {
    font-size: 8pt;
    color: #64748b;
    line-height: 1.5;
}

.cover-accent {
    position: absolute;
    top: 0;
    right: 0;
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%);
    border-radius: 50%;
}

/* Table of Contents */
.toc-page {
    page-break-before: always;
}

.toc-title {
    font-size: 18pt;
    color: #0f172a;
    border-bottom: 3px solid #0ea5e9;
    padding-bottom: 10px;
    margin-bottom: 24px;
}

.toc ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.toc > ul > li {
    font-size: 11pt;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 10px;
    padding-left: 4px;
    border-left: 3px solid transparent;
}

.toc > ul > li::marker {
    content: none;
}

.toc > ul > li > a {
    color: #0ea5e9;
    text-decoration: none;
    display: flex;
    justify-content: space-between;
}

.toc > ul > li > a::after {
    content: leader('.') " " target-counter(attr(href), page);
    color: #64748b;
    font-weight: 400;
    font-size: 10pt;
}

.toc ul li ul {
    margin-top: 6px;
    padding-left: 24px;
}

.toc ul li ul li {
    font-size: 9.5pt;
    color: #64748b;
    margin-bottom: 6px;
}

.toc ul li ul li a {
    color: #94a3b8;
    text-decoration: none;
}

.toc ul li ul li a::after {
    content: leader('.') " " target-counter(attr(href), page);
    color: #94a3b8;
    font-weight: 400;
    font-size: 9pt;
}

/* Tables */
table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    page-break-inside: avoid;
    font-size: 9pt;
}

th {
    background: #0f172a;
    color: #ffffff;
    font-weight: 600;
    text-align: left;
    padding: 10px 12px;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    border: 1px solid #0f172a;
}

td {
    padding: 9px 12px;
    border: 1px solid #e2e8f0;
    vertical-align: top;
}

tr:nth-child(even) td {
    background: #f8fafc;
}

tr:hover td {
    background: #f1f5f9;
}

table code {
    background: #f1f5f9;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 8pt;
    color: #0f172a;
}

/* Code blocks */
pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 16px;
    border-radius: 8px;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 8pt;
    line-height: 1.5;
    margin: 14px 0;
    overflow-x: auto;
    page-break-inside: avoid;
    border: 1px solid #1e293b;
}

pre code {
    color: #e2e8f0;
    font-size: inherit;
    padding: 0;
    background: transparent;
}

code {
    background: #f1f5f9;
    color: #0ea5e9;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 8.5pt;
}

/* Callout boxes */
.callout {
    padding: 16px 20px;
    border-radius: 10px;
    margin: 18px 0;
    page-break-inside: avoid;
    border-left: 5px solid;
}

.callout.info {
    background: #eff6ff;
    border-left-color: #0ea5e9;
    color: #0c4a6e;
}

.callout.warning {
    background: #fffbeb;
    border-left-color: #f59e0b;
    color: #78350f;
}

.callout.danger {
    background: #fef2f2;
    border-left-color: #ef4444;
    color: #991b1b;
}

.callout.success {
    background: #f0fdf4;
    border-left-color: #10b981;
    color: #14532d;
}

.callout-title {
    font-weight: 700;
    font-size: 9.5pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
}

/* Badges */
.badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin: 2px 4px 2px 0;
}

.badge-success {
    background: #dcfce7;
    color: #14532d;
}

.badge-warning {
    background: #fef3c7;
    color: #78350f;
}

.badge-danger {
    background: #fee2e2;
    color: #991b1b;
}

.badge-info {
    background: #dbeafe;
    color: #1e40af;
}

/* Architecture diagrams (code blocks with arch class) */
pre.arch {
    font-size: 7pt;
    line-height: 1.4;
}

/* Feature grid */
.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin: 16px 0;
}

.feature-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 14px;
    page-break-inside: avoid;
}

.feature-card h4 {
    margin-top: 0;
    font-size: 9.5pt;
    color: #0ea5e9;
    margin-bottom: 6px;
}

.feature-card p {
    font-size: 8.5pt;
    margin: 0;
    color: #475569;
}

/* Status indicators */
.status-working {
    color: #10b981;
    font-weight: 600;
}

.status-partial {
    color: #f59e0b;
    font-weight: 600;
}

.status-notimplemented {
    color: #ef4444;
    font-weight: 600;
}

/* Section transitions */
section {
    page-break-before: always;
}

section:first-of-type {
    page-break-before: auto;
}

/* List styling */
ul, ol {
    margin: 10px 0 14px 0;
    padding-left: 24px;
}

li {
    margin-bottom: 6px;
}

ul li::marker {
    color: #0ea5e9;
    font-weight: 700;
}

hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 24px 0;
}

/* Strong emphasis */
strong {
    color: #0f172a;
}

/* Footer note */
.footer-note {
    font-size: 8pt;
    color: #64748b;
    font-style: italic;
    border-top: 1px solid #e2e8f0;
    padding-top: 12px;
    margin-top: 30px;
    page-break-inside: avoid;
}

/* Avoid breaking certain elements */
.blockquote, .callout, table, pre, .feature-card {
    page-break-inside: avoid;
}

h1, h2, h3 {
    page-break-after: avoid;
}

p {
    orphans: 2;
    widows: 2;
}

/* Highlight specific numbers */
.key-number {
    font-weight: 700;
    color: #0ea5e9;
    font-size: 1.1em;
}

/* Architecture diagram text */
pre.arch code {
    font-size: 7pt;
    line-height: 1.3;
}
"""

# Build the full HTML document
html_doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Srujana (DataSentinel) — DPDP Act 2023 Project Report</title>
    <style>{css}</style>
</head>
<body>

<!-- ==================== COVER PAGE ==================== -->
<div class="cover">
    <div class="cover-content">
        <div class="cover-accent"></div>
        <div class="cover-top">
            <span class="cover-badge">Srujana Tech Fest 2026 · 48-Hour Hackathon</span>
            <h1>Srujana (DataSentinel)</h1>
            <div class="cover-subtitle">Practical Data Protection Compliance &amp; Governance Platform for Indian MSMEs<br>
            Statutory Data Protection &amp; Citizen Privacy Governance Engine under the DPDP Act 2023</div>
            <div class="cover-divider"></div>
            <div class="cover-meta">
                <div class="cover-meta-item">
                    <span class="cover-meta-label">Problem Statement</span>
                    <span class="cover-meta-value">LS-04 — Personal Data in Informal Systems</span>
                </div>
                <div class="cover-meta-item">
                    <span class="cover-meta-label">Theme</span>
                    <span class="cover-meta-value">Legal Services · Enterprise Compliance</span>
                </div>
                <div class="cover-meta-item">
                    <span class="cover-meta-label">Track</span>
                    <span class="cover-meta-value">Final Evaluation Dossier &amp; Full-Stack</span>
                </div>
                <div class="cover-meta-item">
                    <span class="cover-meta-label">Repository</span>
                    <span class="cover-meta-value">github.com/naveenTechie07/Srujana_hackathon2026_codeplays</span>
                </div>
                <div class="cover-meta-item">
                    <span class="cover-meta-label">Live Demo</span>
                    <span class="cover-meta-value">srujanahackathon2026codeplays-main.vercel.app</span>
                </div>
                <div class="cover-meta-item">
                    <span class="cover-meta-label">Tests</span>
                    <span class="cover-meta-value">33/33 Passing</span>
                </div>
            </div>
        </div>
        <div class="cover-footer">
            <div class="cover-footer-text">
                <strong>Submitted for Hackathon Evaluation</strong> · Deadline: 10:00 AM, 26 October 2026<br>
                This report documents the complete Srujana (DataSentinel) project including problem understanding,<br>
                proposed solution, system architecture, implementation, testing, and real-world viability.<br>
                <br>
                No API keys, secrets, or credentials are included in this document.
            </div>
        </div>
    </div>
</div>

<!-- ==================== TABLE OF CONTENTS ==================== -->
<div class="toc-page">
    <div class="toc-title">Contents</div>
    <div class="toc">
        {toc_html}
    </div>
</div>

<!-- ==================== REPORT BODY ==================== -->
<div class="report-body">
{body_html}
</div>

<!-- Footer -->
<div class="footer-note">
    <strong>End of Report</strong><br>
    Srujana (DataSentinel) — DPDP Act 2023 Compliance Platform for Indian MSMEs<br>
    Srujana Tech Fest 2026 · Problem Statement LS-04 · Submitted 26 October 2026 · No secrets included
</div>

</body>
</html>"""

# Write HTML for debugging
with open("report.html", "w", encoding="utf-8") as f:
    f.write(html_doc)

# Generate PDF
HTML(string=html_doc, base_url=".").write_pdf("Srujana_DataSentinel_Project_Report.pdf")

print("PDF generated successfully: Srujana_DataSentinel_Project_Report.pdf")
