"""
whatsapp_parser.py - WhatsApp chat export parser.

Parses WhatsApp .txt export format:
[DD/MM/YY, HH:MM:SS AM/PM] Sender: Message content

Extracts sender, timestamp, message body and scans each line for PII.
"""

import re
from typing import List, Dict, Any
from app.services.scanner_engine import scan_text


# WhatsApp export line pattern: [10/10/24, 10:15:22 AM] Sender: Message
WHATSAPP_LINE_PATTERN = re.compile(
    r'^\[(\d{2}/\d{2}/\d{2}),\s+(\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM))\]\s+(.+?):\s+(.*)$'
)


def parse_whatsapp_chat(file_path: str) -> List[Dict[str, Any]]:
    """
    Parse a WhatsApp chat export file and return structured messages
    with PII findings for each message.
    """
    messages = []
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue

                match = WHATSAPP_LINE_PATTERN.match(line)
                if match:
                    date_str, time_str, sender, message = match.groups()
                    pii_findings = scan_text(message, line_number=line_num)

                    messages.append({
                        "line_number": line_num,
                        "date": date_str,
                        "time": time_str,
                        "sender": sender.strip(),
                        "message": message,
                        "pii_findings": [
                            {
                                "pii_type": f.pii_type,
                                "value": f.value,
                                "field_name": f.field_name,
                                "confidence": f.confidence,
                            }
                            for f in pii_findings
                        ],
                        "has_pii": len(pii_findings) > 0,
                    })
                else:
                    # Multi-line message continuation or system message
                    if messages:
                        messages[-1]["message"] += "\n" + line
                        # Re-scan the combined message
                        combined = messages[-1]["message"]
                        pii_findings = scan_text(combined, line_number=line_num)
                        messages[-1]["pii_findings"] = [
                            {
                                "pii_type": f.pii_type,
                                "value": f.value,
                                "field_name": f.field_name,
                                "confidence": f.confidence,
                            }
                            for f in pii_findings
                        ]
                        messages[-1]["has_pii"] = len(pii_findings) > 0
    except Exception:
        pass

    return messages


def extract_phones_from_chat(file_path: str) -> List[str]:
    """Extract all phone numbers from a WhatsApp chat."""
    from app.services.scanner_engine import PHONE_PATTERN
    phones = set()
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            for line in f:
                for m in PHONE_PATTERN.finditer(line):
                    phones.add(m.group())
    except Exception:
        pass
    return sorted(phones)
