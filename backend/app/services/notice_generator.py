"""
notice_generator.py - Multilingual Section 5 notice generator.

Generates statutory notices under DPDP Act Section 5(1) & 5(3) in:
- English
- Hindi (हिन्दी)
- Kannada (ಕನ್ನಡ)

Satisfies the Eighth Schedule constitutional language requirement.
"""

from typing import List, Dict


def _english_notice(
    principal_name: str,
    purpose: str,
    data_items: List[str],
    grievance_contact: str,
    business_name: str,
) -> str:
    items_str = ", ".join(data_items)
    return f"""SECTION 5 NOTICE - DIGITAL PERSONAL DATA PROTECTION ACT, 2023
================================================================

To: {principal_name}
From: {business_name}

We collect the following personal data about you: {items_str}.

Purpose of collection: {purpose}.

Your Rights:
1. Right to access a summary of your personal data (Section 11).
2. Right to correction of inaccurate data (Section 12.1).
3. Right to erasure of data no longer needed (Section 12.2).
4. Right to grievance redressal (Section 13).

You may withdraw your consent at any time with the same ease as giving it.
To exercise your rights or withdraw consent, contact: {grievance_contact}

This notice is provided in English as required under Section 5(3) of the DPDP Act, 2023.
Available also in Hindi and Kannada."""


def _hindi_notice(
    principal_name: str,
    purpose: str,
    data_items: List[str],
    grievance_contact: str,
    business_name: str,
) -> str:
    items_str = ", ".join(data_items)
    return f"""डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 की धारा 5 के अंतर्गत सूचना
================================================================

प्राप्तकर्ता: {principal_name}
प्रेषक: {business_name}

हम आपके बारे में निम्नलिखित व्यक्तिगत डेटा एकत्र करते हैं: {items_str}।

संग्रह का उद्देश्य: {purद्देश्य}

आपके अधिकार:
1. अपने व्यक्तिगत डेटा का सारांश प्राप्त करने का अधिकार (धारा 11)।
2. गलत डेटा को सुधारने का अधिकार (धारा 12.1)।
3. अब आवश्यक नहीं डेटा को मिटाने का अधिकार (धारा 12.2)।
4. शिकायत निवारण का अधिकार (धारा 13)।

आप अपनी सहमति किसी भी समय वापस ले सकते हैं।
अधिकार प्रयोग करने या सहमति वापस लेने के लिए संपर्क करें: {grievance_contact}

यह सूचना अंग्रेजी में भी उपलब्ध है।"""


def _kannada_notice(
    principal_name: str,
    purpose: str,
    data_items: List[str],
    grievance_contact: str,
    business_name: str,
) -> str:
    items_str = ", ".join(data_items)
    return f"""ಡಿಜಿಟಲ್ ವೈಯಕ್ತಿಕ ಡೇಟಾ ಸಂರಕ್ಷಣಾ ಕಾಯ್ದೆ, 2023 ರ ಸೆಕ್ಷನ್ 5 ರ ಅಡಿಯಲ್ಲಿ ಸೂಚನೆ
================================================================

ಪ್ರाप्तকারী: {principal_name}
ಪ್ರವೃತ್ತিকার: {business_name}

ನಾವು ನಿಮ್ಮ ಬಗ್ಗೆ ಈ–)
{n_items_notice}

ಸಂಗ್ರಹಣೆಯ ಉದ್ದೇಶ: {purpose}

ನಿಮ್ಮ ಹಕ್ಕುಗಳು:
1. ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಡೇಟಾದ ಸಾರಾಂಶ ಪಡೆಯುವ hakk (ಸೆಕ್ಷನ್ 11)।
2. ತಪ್ಪು ಡೇಟಾವನ್ನು ಸರಿಪಡಿಸುವ hakk (ಸೆಕ್ಷನ್ 12.1)।
3. ಅಗತ್ಯವಿಲ್ಲದ ಡೇಟಾವನ್ನು ದurezza ಮಾಡುವ hakk (ಸೆಕ್ಷನ್ 12.2)।
4. ಶふとಿ ನಿವಾರಣೆಯ hakk (ಸೆಕ್ಷನ್ 13)।

ಸಹಮತಿಯನ್ನು ಯಾವಾಗಲೂ ವಾಪಸ್ ಪಡೆಯಬಹುದು: {grievance_contact}

ಈ ಸೂಚನೆ ಕನ್ನಡ ಮತ್ತು ಹಿಂದೀ میں પણ ಲಭ್ಯವಿದೆ."""


def generate_notice(
    principal_name: str,
    purpose: str,
    data_items: List[str],
    language: str = "en",
    grievance_contact: str = "privacy@business.com",
    business_name: str = "Small Business",
) -> str:
    """
    Generate a Section 5 notice in the specified language.
    
    Args:
        principal_name: Name of the data principal
        purpose: Purpose of data collection
        data_items: List of personal data items being collected
        language: Language code (en, hi, kn)
        grievance_contact: Grievance officer contact details
        business_name: Name of the business
        
    Returns:
        The notice text as a string
    """
    if language == "hi":
        return _hindi_notice(principal_name, purpose, data_items, grievance_contact, business_name)
    elif language == "kn":
        return _kannada_notice(principal_name, purpose, data_items, grievance_contact, business_name)
    else:
        return _english_notice(principal_name, purpose, data_items, grievance_contact, business_name)


def get_notice_templates() -> Dict[str, Dict[str, str]]:
    """Return pre-built notice templates for common SME workflows."""
    return {
        "clinic_intake": {
            "en": {
                "purpose": "Patient registration, diagnostic testing, and treatment records",
                "data_items": ["Name", "Phone number", "Address", "Aadhaar number", "Medical history", "Test prescriptions"],
            },
            "hi": {
                "purpose": "रोगी पंजीकरण, नैदानिक परीक्षण, और उपचार रिकॉर्ड",
                "data_items": ["नाम", "फोन नंबर", "पता", "आधार संख्या", "चिकित्सा इतिहास", "परीक्षण प्रिस्क्रिप्शन"],
            },
            "kn": {
                "purpose": "ರೋಗಿ ನೋಂದಣಿ, ರೋಗನಿರ್ಣಯ ಪರೀಕ್ಷೆ, ಮತ್ತು ಚಿಕಿತ್ಸೆ ದಾಖಲೆಗಳು",
                "data_items": ["ಹೆಸರು", "ದೂರವಾಣಿ ಸಂಖ್ಯೆ", "ವಿಳಾಸ", "ಆಧಾರ್ ಸಂಖ್ಯೆ", "ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ", "ಪರೀಕ್ಷೆ ಪತ್ರಿಕೆಗಳು"],
            },
        },
        "retail_delivery": {
            "en": {
                "purpose": "Order fulfillment, delivery coordination, and customer support",
                "data_items": ["Name", "Phone number", "Delivery address", "Email address", "Order history"],
            },
            "hi": {
                "purpose": "ऑर्डर पूर्ति, डिलीवरी समन्वय, और ग्राहक सहायता",
                "data_items": ["नाम", "फोन नंबर", "डिलीवरी पता", "ईमेल पता", "ऑर्डर इतिहास"],
            },
            "kn": {
                "purpose": "ಆರ್ಡರ್ ಪೂರೈಕೆ, ವಿತರಣೆಯ თანಸಮನ್ವಯ, ಮತ್ತು ಗ್ರಾಹಕ ಬೆಂಬಲ",
                "data_items": ["ಹೆಸರು", "ದೂರವಾಣಿ ಸಂಖ್ಯೆ", "ವಿತರಣೆಯ ವಿಳಾಸ", "ಇಮೇಲ್ ವಿಳಾಸ", "ಆರ್ಡರ್ ಇತಿಹಾಸ"],
            },
        },
    }
