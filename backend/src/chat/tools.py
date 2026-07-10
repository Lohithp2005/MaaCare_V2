# src/chat/tools.py
from pathlib import Path
from crewai.tools import tool
from google import genai
from google.genai import types
from src.utils.settings import settings

# 1. Initialize a clean, direct Google GenAI client instance
client = genai.Client(api_key=settings.GEMINI_API_KEY)

# Global runtime state tracker to maintain the Gemini file URI across execution threads
ACTIVE_FILE_NAME = None

def ensure_pdf_is_uploaded():
    """
    Locates the pregnancy_guide.pdf inside src/assest/ and uploads it to 
    the Gemini File API cache if it hasn't been mapped yet.
    """
    global ACTIVE_FILE_NAME
    
    try:
        # Resolves path cleanly relative to this specific tools.py file location (src/chat)
        current_dir = Path(__file__).parent
        
        # NOTE: Updated folder string to match your exact directory name: "assest"
        pdf_path = current_dir.parent / "assest" / "pregnancy_guide.pdf"
        
        if not pdf_path.exists():
            print(f"CRITICAL RAG ERROR: PDF manual file not found at expected layout location: {pdf_path.resolve()}")
            return

        print(f"Uploading maternal guidelines background resource: {pdf_path.name}...")
        uploaded_file = client.files.upload(file=pdf_path)
        ACTIVE_FILE_NAME = uploaded_file.name
        print(f"Successfully mounted RAG Document Reference Session token: {ACTIVE_FILE_NAME}")
        
    except Exception as e:
        print(f"Failed to auto-upload operational RAG reference manual: {str(e)}")


@tool("Medical Knowledge Base RAG")
def medical_rag(query: str) -> str:
    """Useful when you need to answer medical questions, find facts, 
    guidelines, or cross-reference general healthcare inquiries using the official handbook."""
    try:
        # Structural fallback state safety check
        if not ACTIVE_FILE_NAME:
            return "System error: The core medical reference database failed to load or initialize on runtime startup."
            
        # Grab file reference instance dynamically from the remote network cache
        pdf_file = client.files.get(name=ACTIVE_FILE_NAME)

        # Execute generation passing the uploaded file reference chunk directly inside the contents payload list
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                pdf_file, 
                f"Analyze the attached pregnancy context documentation carefully. Answer the user query using only factual details from the document source. Query: {query}"
            ],
            config=types.GenerateContentConfig(
                temperature=0.2  # Maintained a lower temperature to prevent algorithmic hallucinations
            )
        )
        return response.text
    except Exception as e:
        return f"Error executing knowledge query base: {str(e)}"