"""
Utility functions and algorithms for SmartPath.
Includes grade conversion, GPA calculation, trend analysis, and more.
"""
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import re


# ==================== GRADE CONVERSION ====================

KENYAN_GRADE_SCALE = {
    "A": 12.0,
    "A-": 11.0,
    "B+": 10.0,
    "B": 9.0,
    "B-": 8.0,
    "C+": 7.0,
    "C": 6.0,
    "C-": 5.0,
    "D+": 4.0,
    "D": 3.0,
    "D-": 2.0,
    "E": 1.0,
}

GRADE_TO_GPA = {
    "A": 4.0,
    "A-": 3.7,
    "B+": 3.3,
    "B": 3.0,
    "B-": 2.7,
    "C+": 2.3,
    "C": 2.0,
    "C-": 1.7,
    "D+": 1.3,
    "D": 1.0,
    "D-": 0.7,
    "E": 0.0,
}


def grade_to_numeric(grade: str) -> float:
    """Convert Kenyan grade to numeric value (0-12 scale)."""
    grade = grade.upper().strip()
    return KENYAN_GRADE_SCALE.get(grade, 0.0)


def grade_to_gpa(grade: str) -> float:
    """Convert Kenyan grade to GPA (0-4.0 scale)."""
    grade = grade.upper().strip()
    return GRADE_TO_GPA.get(grade, 0.0)


def numeric_to_grade(numeric: float) -> str:
    """Convert numeric value to Kenyan grade."""
    if numeric >= 11.5:
        return "A"
    elif numeric >= 10.5:
        return "A-"
    elif numeric >= 9.5:
        return "B+"
    elif numeric >= 8.5:
        return "B"
    elif numeric >= 7.5:
        return "B-"
    elif numeric >= 6.5:
        return "C+"
    elif numeric >= 5.5:
        return "C"
    elif numeric >= 4.5:
        return "C-"
    elif numeric >= 3.5:
        return "D+"
    elif numeric >= 2.5:
        return "D"
    elif numeric >= 1.5:
        return "D-"
    else:
        return "E"


# ==================== GPA CALCULATION ====================

def calculate_gpa(grades: Dict[str, str]) -> float:
    """Calculate overall GPA from subject grades."""
    if not grades:
        return 0.0
    
    total_gpa = sum(grade_to_gpa(grade) for grade in grades.values())
    return round(total_gpa / len(grades), 2)


def calculate_weighted_gpa(grades: Dict[str, str], weights: Optional[Dict[str, float]] = None) -> float:
    """Calculate weighted GPA with optional subject weights."""
    if not grades:
        return 0.0
    
    if weights is None:
        return calculate_gpa(grades)
    
    total_weighted = 0.0
    total_weight = 0.0
    
    for subject, grade in grades.items():
        weight = weights.get(subject, 1.0)
        gpa = grade_to_gpa(grade)
        total_weighted += gpa * weight
        total_weight += weight
    
    return round(total_weighted / total_weight, 2) if total_weight > 0 else 0.0


# ==================== TREND ANALYSIS ====================

def analyze_grade_trend(grades_history: List[float]) -> str:
    """Analyze grade trend from historical data.
    
    Returns: 'improving', 'declining', or 'stable'
    """
    if len(grades_history) < 2:
        return "stable"
    
    # Calculate slope using linear regression
    n = len(grades_history)
    x = list(range(n))
    y = grades_history
    
    sum_x = sum(x)
    sum_y = sum(y)
    sum_xy = sum(x[i] * y[i] for i in range(n))
    sum_x2 = sum(x[i] ** 2 for i in range(n))
    
    slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2) if (n * sum_x2 - sum_x ** 2) != 0 else 0
    
    # Determine trend
    if slope > 0.1:
        return "improving"
    elif slope < -0.1:
        return "declining"
    else:
        return "stable"


def predict_next_grade(grades_history: List[float]) -> float:
    """Predict next grade based on historical trend."""
    if not grades_history:
        return 0.0
    
    if len(grades_history) == 1:
        return grades_history[0]
    
    # Simple linear extrapolation
    trend = analyze_grade_trend(grades_history)
    recent_avg = sum(grades_history[-3:]) / min(3, len(grades_history))
    
    if trend == "improving":
        return min(12.0, recent_avg + 0.5)
    elif trend == "declining":
        return max(1.0, recent_avg - 0.3)
    else:
        return recent_avg


# ==================== SUBJECT ANALYSIS ====================

def identify_strong_subjects(grades: Dict[str, str], threshold: str = "B+") -> List[str]:
    """Identify subjects with grades above threshold."""
    threshold_numeric = grade_to_numeric(threshold)
    return [
        subject for subject, grade in grades.items()
        if grade_to_numeric(grade) >= threshold_numeric
    ]


def identify_weak_subjects(grades: Dict[str, str], threshold: str = "C") -> List[str]:
    """Identify subjects with grades below threshold."""
    threshold_numeric = grade_to_numeric(threshold)
    return [
        subject for subject, grade in grades.items()
        if grade_to_numeric(grade) < threshold_numeric
    ]


def calculate_strength_score(grade: str, trend: str = "stable") -> float:
    """Calculate strength score (0-100) for a subject."""
    base_score = (grade_to_numeric(grade) / 12.0) * 100
    
    # Adjust based on trend
    if trend == "improving":
        base_score += 5
    elif trend == "declining":
        base_score -= 5
    
    return max(0, min(100, base_score))


# ==================== CAREER MATCHING ====================

# Subject to career mapping for Kenyan context
SUBJECT_CAREER_MAP = {
    "Mathematics": ["Engineering", "Computer Science", "Actuarial Science", "Statistics", "Economics"],
    "Physics": ["Engineering", "Physics", "Architecture", "Aviation", "Astronomy"],
    "Chemistry": ["Medicine", "Pharmacy", "Chemical Engineering", "Chemistry", "Biochemistry"],
    "Biology": ["Medicine", "Veterinary Medicine", "Biology", "Biotechnology", "Agriculture"],
    "English": ["Law", "Journalism", "Literature", "Education", "Communication"],
    "Kiswahili": ["Education", "Linguistics", "Journalism", "Translation", "Tourism"],
    "History": ["Law", "History", "Political Science", "International Relations", "Archaeology"],
    "Geography": ["Urban Planning", "Environmental Science", "Geology", "Tourism", "Surveying"],
    "Business Studies": ["Business Administration", "Accounting", "Finance", "Marketing", "Entrepreneurship"],
    "Computer Studies": ["Computer Science", "Software Engineering", "IT", "Cybersecurity", "Data Science"],
    "Agriculture": ["Agriculture", "Agribusiness", "Agricultural Engineering", "Horticulture", "Veterinary Medicine"],
}


def get_career_match_score(
    subjects: List[str],
    grades: Dict[str, str],
    career_path: str,
    required_subjects: Optional[List[str]] = None
) -> float:
    """Calculate career match score (0-100) based on subjects and grades."""
    if required_subjects is None:
        # Default: check if any relevant subject exists
        relevant_subjects = []
        for subject, careers in SUBJECT_CAREER_MAP.items():
            if career_path in careers and subject in subjects:
                relevant_subjects.append(subject)
        
        if not relevant_subjects:
            return 50.0  # Neutral score if no direct match
        
        # Calculate average grade for relevant subjects
        relevant_grades = [grade_to_numeric(grades.get(s, "E")) for s in relevant_subjects if s in grades]
        if not relevant_grades:
            return 50.0
        
        avg_grade = sum(relevant_grades) / len(relevant_grades)
        return (avg_grade / 12.0) * 100
    
    else:
        # Check required subjects
        missing_subjects = [s for s in required_subjects if s not in subjects]
        if missing_subjects:
            return 0.0  # Cannot match without required subjects
        
        # Calculate score based on required subject grades
        required_grades = [grade_to_numeric(grades.get(s, "E")) for s in required_subjects]
        avg_grade = sum(required_grades) / len(required_grades)
        return (avg_grade / 12.0) * 100


# ==================== STUDY PLANNING ====================

def calculate_study_hours_needed(
    weak_subjects: List[str],
    exam_date: Optional[datetime] = None,
    current_date: Optional[datetime] = None
) -> Dict[str, float]:
    """Calculate study hours needed per subject."""
    if current_date is None:
        current_date = datetime.utcnow()
    
    if exam_date is None:
        # Default: 3 months from now
        exam_date = current_date + timedelta(days=90)
    
    days_available = (exam_date - current_date).days
    if days_available <= 0:
        days_available = 90
    
    # Allocate more hours to weak subjects
    total_subjects = len(weak_subjects)
    if total_subjects == 0:
        return {}
    
    # Base: 2 hours per week per subject
    hours_per_subject = {}
    for subject in weak_subjects:
        # Weak subjects need more time
        hours_per_subject[subject] = (2.5 * days_available) / 7  # 2.5 hours per week
    
    return hours_per_subject


def prioritize_study_topics(
    subjects: List[str],
    grades: Dict[str, str],
    exam_weights: Optional[Dict[str, float]] = None
) -> List[Tuple[str, int]]:
    """Prioritize study topics based on weakness and exam importance.
    
    Returns: List of (subject, priority_score) tuples, sorted by priority.
    """
    priorities = []
    
    for subject in subjects:
        grade = grades.get(subject, "E")
        grade_numeric = grade_to_numeric(grade)
        
        # Base priority: lower grade = higher priority
        priority = 12.0 - grade_numeric
        
        # Adjust by exam weight if provided
        if exam_weights and subject in exam_weights:
            priority *= exam_weights[subject]
        
        priorities.append((subject, int(priority * 10)))
    
    # Sort by priority (descending)
    priorities.sort(key=lambda x: x[1], reverse=True)
    return priorities


# ==================== FLASHCARD ALGORITHMS ====================

def calculate_next_review_date(
    last_reviewed: datetime,
    difficulty: str,
    correct: bool,
    times_reviewed: int
) -> datetime:
    """Calculate next review date using spaced repetition (Leitner system)."""
    # Base intervals (in days)
    intervals = {
        "easy": [1, 3, 7, 14, 30],
        "medium": [1, 2, 5, 10, 21],
        "hard": [1, 1, 3, 7, 14],
    }
    
    interval_list = intervals.get(difficulty, intervals["medium"])
    
    # Determine interval based on review count and correctness
    if times_reviewed < len(interval_list):
        if correct:
            interval_days = interval_list[times_reviewed]
        else:
            # Reset to first interval if incorrect
            interval_days = interval_list[0]
    else:
        # Use maximum interval for well-mastered cards
        interval_days = interval_list[-1]
    
    return last_reviewed + timedelta(days=interval_days)


def calculate_mastery_level(
    times_reviewed: int,
    times_correct: int,
    difficulty: str
) -> float:
    """Calculate mastery level (0-1) for a flashcard."""
    if times_reviewed == 0:
        return 0.0
    
    accuracy = times_correct / times_reviewed
    
    # Adjust for difficulty
    difficulty_multiplier = {
        "easy": 1.0,
        "medium": 0.9,
        "hard": 0.8,
    }
    
    mastery = accuracy * difficulty_multiplier.get(difficulty, 0.9)
    return min(1.0, mastery)


def adjust_difficulty(
    current_difficulty: str,
    times_reviewed: int,
    times_correct: int
) -> str:
    """Adjust flashcard difficulty based on performance."""
    if times_reviewed < 3:
        return current_difficulty  # Need more data
    
    accuracy = times_correct / times_reviewed
    
    difficulty_order = ["easy", "medium", "hard"]
    current_index = difficulty_order.index(current_difficulty) if current_difficulty in difficulty_order else 1
    
    if accuracy >= 0.8 and current_index < len(difficulty_order) - 1:
        # Move to harder difficulty
        return difficulty_order[current_index + 1]
    elif accuracy < 0.5 and current_index > 0:
        # Move to easier difficulty
        return difficulty_order[current_index - 1]
    else:
        return current_difficulty


# ==================== TEXT PROCESSING & OCR ====================

def extract_grades_from_text(text: str) -> Dict[str, str]:
    """Extract grades from OCR text using regex patterns.
    
    This function looks for patterns like:
    - Mathematics: A
    - English - B+
    - Biology    A-
    - Table format: ENGLISH | 74 | 62 | 68 | B | 9 | 4
    """
    grades = {}
    
    # Comprehensive list of common subject names and variations
    subject_patterns = [
        "mathematics", "math", "maths",
        "english", "eng",
        "kiswahili", "kisw", "swahili",
        "biology", "bio",
        "chemistry", "chem",
        "physics", "phy",
        "history", "hist", "history & gov", "history and government",
        "geography", "geo",
        "cre", "c.r.e", "christian religious education",
        "business studies", "business", "bus",
        "computer studies", "computer", "comp", "ict",
        "agriculture", "agric",
        "home science",
        "music",
        "art", "art and design",
        "french", "german", "arabic"
    ]
    
    # Clean up text - remove excessive spaces and normalize
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\|+', '|', text)  # Normalize pipe separators
    
    # Pattern 1: Table format with pipes (e.g., "ENGLISH | 74 | 62 | 68 | B | 9")
    # This matches Kenyan report card format: SUBJECT | EXAM1 | EXAM2 | TOTAL% | GRADE | POINTS | POS
    table_pattern = r'([A-Za-z][A-Za-z\s\.&]+?)\s*\|\s*\d+\s*\|\s*\d+\s*\|\s*\d+\s*\|\s*([A-E][\+\-]?)\s*\|'
    matches = re.finditer(table_pattern, text, re.IGNORECASE)
    for match in matches:
        subject_raw = match.group(1).strip()
        grade_raw = match.group(2).strip().upper()
        
        if grade_raw in KENYAN_GRADE_SCALE and len(subject_raw) >= 3:
            subject = normalize_subject_name(subject_raw)
            grades[subject] = grade_raw
    
    # Pattern 2: Table format without pipes (multiple spaces)
    # E.g., "ENGLISH    74    62    68    B    9    4"
    table_spaces_pattern = r'([A-Za-z][A-Za-z\s\.&]+?)\s{2,}\d+\s+\d+\s+\d+\s+([A-E][\+\-]?)\s+\d+'
    matches = re.finditer(table_spaces_pattern, text, re.IGNORECASE)
    for match in matches:
        subject_raw = match.group(1).strip()
        grade_raw = match.group(2).strip().upper()
        
        if grade_raw in KENYAN_GRADE_SCALE and len(subject_raw) >= 3:
            subject = normalize_subject_name(subject_raw)
            grades[subject] = grade_raw
    
    # Pattern 3: Simple colon/dash format (e.g., "Mathematics: A")
    simple_patterns = [
        r'([A-Za-z][A-Za-z\s\.&]+?)\s*[:\-]\s*([A-E][\+\-]?)\s*(?:\n|$|\||,)',
        r'([A-Za-z][A-Za-z\s\.&]+?)\s{3,}([A-E][\+\-]?)\s*(?:\n|$)',
        r'^([A-Za-z][A-Za-z\s\.&]{2,}?)\s+([A-E][\+\-]?)\s*$',
    ]
    
    for pattern in simple_patterns:
        matches = re.finditer(pattern, text, re.MULTILINE | re.IGNORECASE)
        for match in matches:
            subject_raw = match.group(1).strip()
            grade_raw = match.group(2).strip().upper()
            
            if len(subject_raw) < 3 or grade_raw not in KENYAN_GRADE_SCALE:
                continue
            
            # Validate it looks like a subject name
            is_known_subject = any(
                pattern_sub.lower() in subject_raw.lower() 
                for pattern_sub in subject_patterns
            )
            
            # Check if it starts with capital letter (typical for subject names)
            looks_like_subject = subject_raw[0].isupper() and not subject_raw.isupper()
            
            if is_known_subject or looks_like_subject:
                subject = normalize_subject_name(subject_raw)
                if subject not in grades:  # Don't override table matches
                    grades[subject] = grade_raw
    
    return grades


def extract_grades_with_gemini(image_path: str) -> Dict[str, str]:
    """Extract grades from report card image using Gemini Vision AI.
    
    Args:
        image_path: Path to the image file (supports PDF, PNG, JPG)
        
    Returns:
        Dictionary of {subject: grade}
    """
    try:
        import google.generativeai as genai
        from PIL import Image
        
        # Get API key from config
        from config import settings
        
        if not settings.GEMINI_API_KEY:
            raise RuntimeError(
                "GEMINI_API_KEY not configured. Please add your Gemini API key to .env file.\n"
                "Get your API key from: https://makersuite.google.com/app/apikey"
            )
        
        # Configure Gemini
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # Use Gemini 1.5 Flash for vision (fast and cost-effective)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Open the image
        image = Image.open(image_path)
        
        # Create a detailed prompt for grade extraction
        prompt = """You are analyzing a student report card. Extract ALL subject names and their corresponding grades.

IMPORTANT INSTRUCTIONS:
1. Look for the grades table/section in the report card
2. Extract ONLY the subject name and final grade (usually in columns like GRADE or TOTAL GRADE)
3. Return the results as a JSON object with subject names as keys and grades as values
4. Use standard subject names (e.g., "English", "Mathematics", "Kiswahili")
5. Grades are typically letters: A, A-, B+, B, B-, C+, C, C-, D+, D, D-, E
6. If you see "History & Government" or "History and Government", use "History"
7. If you see "C.R.E" or "Christian Religious Education", use "CRE"
8. Ignore exam scores (EXAM 1, EXAM 2) - only get the final GRADE column

Example format to return:
{
  "English": "B",
  "Kiswahili": "A",
  "Mathematics": "C",
  "Physics": "A-",
  "Chemistry": "B",
  "Biology": "B+",
  "History": "A",
  "Geography": "B",
  "CRE": "B+",
  "Agriculture": "A"
}

CRITICAL: Return ONLY the JSON object, no other text. If no grades are found, return an empty object: {}
"""
        
        # Send to Gemini for analysis
        response = model.generate_content([prompt, image])
        
        # Parse the response
        import json
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```'):
            # Remove ```json or ``` at start and ``` at end
            response_text = response_text.split('\n', 1)[1]  # Remove first line
            response_text = response_text.rsplit('\n', 1)[0]  # Remove last line
            response_text = response_text.strip()
        
        # Parse JSON
        try:
            grades = json.loads(response_text)
            
            # Validate that it's a dict with string keys and values
            if not isinstance(grades, dict):
                raise ValueError("Response is not a dictionary")
            
            # Normalize grades to uppercase and validate
            normalized_grades = {}
            for subject, grade in grades.items():
                if isinstance(subject, str) and isinstance(grade, str):
                    grade_upper = grade.strip().upper()
                    # Validate it's a real grade
                    if grade_upper in KENYAN_GRADE_SCALE or len(grade_upper) <= 2:
                        normalized_grades[subject.strip()] = grade_upper
            
            return normalized_grades
            
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract key-value pairs manually
            print(f"Failed to parse JSON response: {response_text}")
            return {}
            
    except ImportError:
        raise RuntimeError(
            "google-generativeai not installed. Please install it:\n"
            "pip install google-generativeai"
        )
    except Exception as e:
        raise RuntimeError(f"Gemini AI extraction failed: {str(e)}")


def extract_grades_from_pdf_with_gemini(pdf_path: str) -> Dict[str, str]:
    """Extract grades from PDF report card using Gemini Vision AI.
    
    For PDFs, we convert the first page to an image and use Gemini to analyze it.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        Dictionary of {subject: grade}
    """
    try:
        from pdf2image import convert_from_path
        import tempfile
        
        # Convert first page of PDF to image
        # Check if poppler is available (but don't require it)
        try:
            images = convert_from_path(pdf_path, dpi=300, first_page=1, last_page=1)
        except Exception as e:
            # If pdf2image fails, try without it (user might have removed poppler)
            raise RuntimeError(
                "Could not convert PDF to image. Please install poppler-utils.\n"
                "Alternatively, convert the PDF to an image (PNG/JPG) and upload that.\n"
                f"Error: {str(e)}"
            )
        
        if not images:
            raise RuntimeError("Could not extract any pages from the PDF")
        
        # Save the first page as a temporary image
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
            images[0].save(tmp_file.name, 'PNG')
            temp_image_path = tmp_file.name
        
        try:
            # Use Gemini to extract grades from the image
            grades = extract_grades_with_gemini(temp_image_path)
            return grades
        finally:
            # Clean up temp file
            if os.path.exists(temp_image_path):
                os.unlink(temp_image_path)
                
    except ImportError:
        raise RuntimeError(
            "pdf2image not installed. Please install it:\n"
            "pip install pdf2image\n"
            "Or convert your PDF to PNG/JPG and upload the image instead."
        )


def extract_grades_from_file(file_path: str, file_type: Optional[str] = None) -> Dict[str, str]:
    """Extract grades from an uploaded file (image or PDF).
    
    Args:
        file_path: Path to the uploaded file
        file_type: MIME type of the file (optional, will be inferred if not provided)
        
    Returns:
        Dictionary of {subject: grade}
    """
    import os
    
    # Determine file type if not provided
    if file_type is None:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.pdf':
            file_type = 'application/pdf'
        elif ext in ['.jpg', '.jpeg']:
            file_type = 'image/jpeg'
        elif ext == '.png':
            file_type = 'image/png'
    
    # Extract grades using Gemini AI based on file type
    try:
        if file_type == 'application/pdf':
            return extract_grades_from_pdf_with_gemini(file_path)
        elif file_type and file_type.startswith('image/'):
            return extract_grades_with_gemini(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
    except Exception as e:
        # Return empty dict on error but log it
        print(f"Error extracting grades from file: {e}")
        return {}


def normalize_subject_name(subject: str) -> str:
    """Normalize subject name to standard format."""
    subject = subject.strip().title()
    
    # Remove common prefixes/suffixes and clean up
    subject = re.sub(r'\s+', ' ', subject)
    subject = subject.replace('&', 'and')
    
    # Common variations and full names
    variations = {
        "Math": "Mathematics",
        "Maths": "Mathematics",
        "Eng": "English",
        "Kisw": "Kiswahili",
        "Kiswahi": "Kiswahili",
        "Bio": "Biology",
        "Chem": "Chemistry",
        "Phy": "Physics",
        "Hist": "History",
        "History And Gov": "History",
        "History And Government": "History",
        "History & Gov": "History",
        "Geo": "Geography",
        "Comp": "Computer Studies",
        "Computer": "Computer Studies",
        "Agric": "Agriculture",
        "Bus": "Business Studies",
        "Business": "Business Studies",
        "C.R.E": "CRE",
        "C.R.E.": "CRE",
        "Christian Religious Education": "CRE",
        "Home Sci": "Home Science",
        "Home Science": "Home Science",
    }
    
    # Check variations
    for key, value in variations.items():
        if key.lower() == subject.lower():
            return value
    
    return subject


# ==================== DATE UTILITIES ====================

def get_term_dates(year: int, term: int) -> Tuple[datetime, datetime]:
    """Get start and end dates for a Kenyan school term."""
    # Approximate term dates (adjust as needed)
    term_starts = {
        1: datetime(year, 1, 15),  # Term 1: Jan-Apr
        2: datetime(year, 5, 1),   # Term 2: May-Aug
        3: datetime(year, 9, 1),   # Term 3: Sep-Nov
    }
    
    term_ends = {
        1: datetime(year, 4, 30),
        2: datetime(year, 8, 31),
        3: datetime(year, 11, 30),
    }
    
    start = term_starts.get(term, datetime(year, 1, 1))
    end = term_ends.get(term, datetime(year, 12, 31))
    
    return start, end

