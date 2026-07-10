# chat/services.py
from dataclasses import dataclass
from typing import Optional
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.google import GoogleModel
from pydantic_ai.providers.google import GoogleProvider
from src.utils.settings import settings
from src.users import controller

# 1. Initialize the Provider with your API key
google_provider = GoogleProvider(api_key=settings.GEMINI_API_KEY)

# 2. Attach it to the GoogleModel instance
gemini_model = GoogleModel(
    'gemini-2.5-flash', 
    provider=google_provider
)

# 3. Define the runtime context container (Deps)
@dataclass
class UserContext:
    request: any
    db: any

# 4. Define your specialized agents using the model
diet_agent = Agent(
    model=gemini_model,
    deps_type=UserContext,
    system_prompt=(
        "You are an elite clinical nutritionist. Evaluate the provided user query "
        "and cross-reference it strictly against any provided Patient Profile Context. "
        "Provide personalized, highly specific diet recommendations, portion ideas, or safer alternatives "
        "based on their health state, allergies, or trimesters."
    )
)



# 5. Define the Orchestration Agent (Strict Plan-and-Execute Loop)
manager_agent = Agent(
    model=gemini_model,
    deps_type=UserContext,
    system_prompt=(
      "You are the Lead Clinical Orchestrator. Your first task is to analyze the user's intent "
        "and decide if the query is a general question or a health/diet-specific question.\n\n"
        
        "ROUTE 1: GENERAL QUERIES\n"
        "If the user is asking general, non-clinical questions (e.g., greeting you, asking how the system works, "
        "or technical troubleshooting), answer directly, politely, and concisely yourself.\n\n"
        
        "ROUTE 2: HEALTH, DIET, OR CLINICAL QUERIES\n"
        "If the query involves health, symptoms, diet, allergies, or specific foods, you must NEVER answer it yourself. "
        "Instead, strictly follow this CRITICAL WORKFLOW:\n"
        "1. STEP 1 (MANDATORY): Immediately execute the `fetch_patient_clinical_profile` tool. Do not skip this.\n"
        "2. STEP 2: Review what the profile tool returned. Even if it says 'No profile details found', proceed to step 3.\n"
        "3. STEP 3: Call the appropriate specialist tool (`delegate_to_diet_specialist` for foods/peanuts) "
        "and pass the exact profile string you obtained into the `clinical_profile_context` argument.\n"
        "4. STEP 4: Return the exact answer provided by your specialist directly to the user.\n\n"
        
        "CRITICAL RULE: Never tell the user that you lack their profile information."
    )
)

# --- Register Tools ---

def fetch_patient_clinical_profile(ctx: RunContext[UserContext]) -> str:
    """Useful when you need to check the patient's specific medical conditions, 
    trimesters, allergies, or health details before answering a query."""
    try:
        # Call the database controller
        profile_response = controller.get_decrypt_details(ctx.deps.request, ctx.deps.db)
        
        # If the controller returned a dict, process it properly
        if isinstance(profile_response, dict):
            if "message" in profile_response:
                return f"Profile lookup failed: {profile_response['message']}"
            if "details" in profile_response:
                return str(profile_response["details"])
                
        return str(profile_response)
    except Exception as e:
        return f"Error pulling clinical profile: {str(e)}"

# Programmatically register the clinical profile tool to all agents

# --- Intelligent Orchestration Delegation Tools ---

@manager_agent.tool
async def delegate_to_diet_specialist(ctx: RunContext[UserContext], query: str, clinical_profile_context: Optional[str] = None) -> str:
    """Delegate dietary, meal-planning, or nutritional questions to the Diet Specialist.
    Always pass the clinical profile string into `clinical_profile_context` if you have retrieved it."""
    
    enriched_query = query
    if clinical_profile_context:
        enriched_query = f"Patient Profile Context: {clinical_profile_context}\n\nUser Question: {query}"
        
    result = await diet_agent.run(enriched_query, deps=ctx.deps, usage=ctx.usage)
    return str(result.output)




# 6. Core Entrypoint Execution Function
async def run_health_assistant(user_query: str, request, db) -> str:
    ctx_deps = UserContext(request=request, db=db)
    result = await manager_agent.run(user_query, deps=ctx_deps)
    return str(result.output)