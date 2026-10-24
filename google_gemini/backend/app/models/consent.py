from pydantic import BaseModel
from typing import List, Optional

class NoticeTemplate(BaseModel):
    language: str             # "en", "hi", "kn"
    language_display: str     # "English", "हिन्दी (Hindi)", "ಕನ್ನಡ (Kannada)"
    title: str
    body_text: str
    purpose: str
    data_points_collected: List[str]
    retention_period: str
    grievance_contact: str
    statutory_citation: str = "Digital Personal Data Protection Act, 2023 - Section 5(1) & (3)"

class ConsentRecord(BaseModel):
    id: Optional[int] = None
    principal_id: str         # Phone or Email
    principal_name: Optional[str] = None
    purpose: str
    notice_version: str
    language: str
    timestamp: str
    channel: str              # "whatsapp_keyword", "web_form", "counter_slip"
    status: str               # "ACTIVE", "WITHDRAWN", "EXPIRED"
    expiry_date: Optional[str] = None

class CreateConsentRequest(BaseModel):
    principal_id: str
    principal_name: Optional[str] = None
    purpose: str
    language: str = "en"
    channel: str = "whatsapp_keyword"
    validity_months: int = 12
