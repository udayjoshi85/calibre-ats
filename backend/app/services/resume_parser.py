import re
import io
from typing import Optional

import fitz  # PyMuPDF
from docx import Document


def parse_resume(content: bytes, filename: str) -> str:
    """Parse resume content from PDF or DOCX."""
    filename_lower = filename.lower()

    if filename_lower.endswith(".pdf"):
        return parse_pdf(content)
    elif filename_lower.endswith(".docx"):
        return parse_docx(content)
    else:
        # Try to decode as plain text
        try:
            return content.decode("utf-8")
        except UnicodeDecodeError:
            return content.decode("latin-1")


def parse_pdf(content: bytes) -> str:
    """Extract text from PDF using PyMuPDF."""
    text_parts = []

    with fitz.open(stream=content, filetype="pdf") as doc:
        for page in doc:
            text_parts.append(page.get_text())

    return "\n".join(text_parts)


def parse_docx(content: bytes) -> str:
    """Extract text from DOCX using python-docx."""
    doc = Document(io.BytesIO(content))

    text_parts = []
    for paragraph in doc.paragraphs:
        text_parts.append(paragraph.text)

    return "\n".join(text_parts)


def extract_profile_links(text: str) -> dict:
    """Extract LinkedIn, GitHub, Notion, and portfolio links from resume text."""
    links = {
        "linkedin": None,
        "github": None,
        "notion": None,
        "portfolio": None,
    }

    # LinkedIn
    linkedin_pattern = r"(?:https?://)?(?:www\.)?linkedin\.com/in/[\w\-]+"
    linkedin_match = re.search(linkedin_pattern, text, re.IGNORECASE)
    if linkedin_match:
        url = linkedin_match.group()
        if not url.startswith("http"):
            url = "https://" + url
        links["linkedin"] = url

    # GitHub
    github_pattern = r"(?:https?://)?(?:www\.)?github\.com/[\w\-]+"
    github_match = re.search(github_pattern, text, re.IGNORECASE)
    if github_match:
        url = github_match.group()
        if not url.startswith("http"):
            url = "https://" + url
        links["github"] = url

    # Notion
    notion_pattern = r"(?:https?://)?(?:www\.)?notion\.so/[\w\-/]+"
    notion_match = re.search(notion_pattern, text, re.IGNORECASE)
    if notion_match:
        url = notion_match.group()
        if not url.startswith("http"):
            url = "https://" + url
        links["notion"] = url

    # Portfolio (common patterns)
    portfolio_patterns = [
        r"(?:portfolio|website|personal site|my site)[:\s]+(?:https?://)?[\w\.\-]+\.[a-z]{2,}[^\s]*",
        r"(?:https?://)?[\w\-]+\.(?:dev|io|me|com|net|org)/[\w\-/]*",
    ]

    for pattern in portfolio_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            url = match.group()
            # Clean up the URL
            url = re.sub(r"^(?:portfolio|website|personal site|my site)[:\s]+", "", url, flags=re.IGNORECASE)
            if not url.startswith("http"):
                url = "https://" + url
            # Avoid false positives
            if "linkedin" not in url.lower() and "github" not in url.lower() and "notion" not in url.lower():
                links["portfolio"] = url
                break

    return links


def calculate_resume_quality_metrics(text: str, experience_years: int) -> dict:
    """Calculate resume quality metrics."""
    # Word count
    words = len(text.split())

    # Expected length based on experience (rough guideline)
    # Entry level: 300-500 words
    # Mid level: 400-700 words
    # Senior: 500-900 words
    expected_min = 300 + (experience_years * 50)
    expected_max = 500 + (experience_years * 80)

    # Length score
    if expected_min <= words <= expected_max:
        length_score = 100
    elif words < expected_min:
        length_score = max(50, int((words / expected_min) * 100))
    else:
        # Too long - penalize slightly
        length_score = max(60, 100 - int((words - expected_max) / 50))

    # Clarity indicators
    bullet_points = len(re.findall(r"^[\s]*[•\-\*]", text, re.MULTILINE))
    sections = len(re.findall(r"^[A-Z][A-Z\s]{2,}:?$", text, re.MULTILINE))

    # Action verbs (indicates strong writing)
    action_verbs = [
        "achieved", "built", "created", "delivered", "developed", "drove",
        "improved", "increased", "launched", "led", "managed", "optimized",
        "reduced", "scaled", "streamlined", "transformed"
    ]
    action_verb_count = sum(1 for verb in action_verbs if verb in text.lower())

    return {
        "word_count": words,
        "length_score": length_score,
        "bullet_points": bullet_points,
        "sections": sections,
        "action_verb_count": action_verb_count,
    }
