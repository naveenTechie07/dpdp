from typing import List, Dict
from ..models.consent import NoticeTemplate

NOTICES: Dict[str, NoticeTemplate] = {
    "en": NoticeTemplate(
        language="en",
        language_display="English",
        title="Patient & Customer Privacy Notice",
        body_text="We collect and process your digital personal data in compliance with the Digital Personal Data Protection Act, 2023. Your contact number, name, and diagnostic test details are collected strictly for test reporting, appointment scheduling, and statutory tax invoicing. We do not sell your personal data. You have the right to access, correct, and request erasure of your data at any time.",
        purpose="Diagnostic Services, Billing, and Medical Record Keeping",
        data_points_collected=["Full Name", "Mobile Number", "Address", "Doctor Prescription", "Billing Details"],
        retention_period="Active clinical treatment + 6 years statutory tax retention under CGST Act",
        grievance_contact="Grievance Officer: contact@aarogyaclinic.in | Phone: +91 9845012345",
        statutory_citation="Digital Personal Data Protection Act, 2023 - Section 5(1) & (3)"
    ),
    "kn": NoticeTemplate(
        language="kn",
        language_display="ಕನ್ನಡ (Kannada)",
        title="ರೋಗಿ ಮತ್ತು ಗ್ರಾಹಕರ ಗೌಪ್ಯತಾ ಸೂಚನೆ",
        body_text="ಡಿಜಿಟಲ್ ವೈಯಕ್ತಿಕ ಡೇಟಾ ಸಂರಕ್ಷಣಾ ಕಾಯ್ದೆ, 2023 ರ ಅನ್ವಯ ನಾವು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ಸಂಗ್ರಹಿಸುತ್ತೇವೆ. ನಿಮ್ಮ ಹೆಸರು, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮತ್ತು ಆರೋಗ್ಯ ಪರೀಕ್ಷಾ ವಿವರಗಳನ್ನು ಕೇವಲ ವೈದ್ಯಕೀಯ ವರದಿ ಮತ್ತು ಬಿಲ್ಲು ನೀಡಲು ಮಾತ್ರ ಬಳಸಲಾಗುತ್ತದೆ. ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ಯಾವುದೇ ಮೂರನೇ ವ್ಯಕ್ತಿಗೆ ಮಾರಾಟ ಮಾಡಲಾಗುವುದಿಲ್ಲ. ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ನಿಮ್ಮ ಡೇಟಾವನ್ನು ವೀಕ್ಷಿಸಲು, ಸರಿಪಡಿಸಲು ಅಥವಾ ಅಳಿಸಲು ವಿನಂತಿಸುವ ಹಕ್ಕು ನಿಮಗಿದೆ.",
        purpose="ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆಗಳು, ಬಿಲ್ಲು ಪಾವತಿ ಮತ್ತು ಆರೋಗ್ಯ ದಾಖಲೆ ನಿರ್ವಹಣೆ",
        data_points_collected=["ಪೂರ್ಣ ಹೆಸರು", "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ", "ವಿಳಾಸ", "ವೈದ್ಯರ ಚೀಟಿ", "ಬಿಲ್ ವಿವರಗಳು"],
        retention_period="ಚಿಕಿತ್ಸಾ ಅವಧಿ + ಜಿಎಸ್‌ಟಿ ಕಾಯ್ದೆಯಡಿ 6 ವರ್ಷಗಳ ಶಾಸನಬದ್ಧ ಉಳಿಕೆ",
        grievance_contact="ಕುಂದುಕೊರತೆ ಅಧಿಕಾರಿ: contact@aarogyaclinic.in | ದೂರವಾಣಿ: +91 9845012345",
        statutory_citation="ಡಿಜಿಟಲ್ ವೈಯಕ್ತಿಕ ಡೇಟಾ ಸಂರಕ್ಷಣಾ ಕಾಯ್ದೆ 2023 - ಸೆಕ್ಷನ್ 5"
    ),
    "hi": NoticeTemplate(
        language="hi",
        language_display="हिन्दी (Hindi)",
        title="मरीज एवं ग्राहक डेटा गोपनीयता सूचना",
        body_text="डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 के तहत हम आपके व्यक्तिगत डेटा को सुरक्षित रूप से संसाधित करते हैं। आपका नाम, मोबाइल नंबर और नैदानिक परीक्षण विवरण केवल रिपोर्टिंग, अपॉइंटमेंट और जीएसटी बिलिंग के उद्देश्य से एकत्र किए जाते हैं। हम आपका डेटा किसी तीसरे पक्ष को नहीं बेचते हैं। आपके पास अपने डेटा को देखने, सही करने और हटाने का पूर्ण कानूनी अधिकार है।",
        purpose="नैदानिक सेवाएं, बिलिंग और मेडिकल रिकॉर्ड प्रबंधन",
        data_points_collected=["पूरा नाम", "मोबाइल नंबर", "पता", "डॉक्टर का पर्चा", "बिलिंग विवरण"],
        retention_period="सक्रिय उपचार अवधि + जीएसटी अधिनियम के तहत 6 वर्ष की वैधानिक अवधि",
        grievance_contact="शिकायत अधिकारी: contact@aarogyaclinic.in | फोन: +91 9845012345",
        statutory_citation="डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 - धारा 5"
    )
}

def get_notice(language: str = "en") -> NoticeTemplate:
    return NOTICES.get(language, NOTICES["en"])

def get_all_notices() -> List[NoticeTemplate]:
    return list(NOTICES.values())
