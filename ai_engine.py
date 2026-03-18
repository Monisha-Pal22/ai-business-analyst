# ai_engine.py
# AI Engine with Groq + chat memory

# import os
# from dotenv import load_dotenv
# import httpx
# from groq import Groq

# load_dotenv()

# http_client = httpx.Client()
# groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"), http_client=http_client)

# # import os
# # from dotenv import load_dotenv
# # from groq import Groq

# # load_dotenv()

# # GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# # groq_client = Groq(api_key=GROQ_API_KEY)


# def build_system_prompt(context, industry_context=""):
#     return f"""
# {industry_context}

# You are an expert AI Business Analyst and Strategic Advisor.
# Analyze business data and give clear, actionable insights.

# Rules:
# - Be clear and professional
# - Use numbers from the data when answering
# - Give specific actionable recommendations
# - Keep answers concise but complete
# - If you detect a problem, suggest a solution

# Business Data Context:
# {context}
# """


# def ask_ai_chat(messages, max_tokens=600):
#     try:
#         response = groq_client.chat.completions.create(
#             model="llama-3.1-8b-instant",
#             messages=messages,
#             temperature=0.7,
#             max_tokens=max_tokens
#         )
#         return response.choices[0].message.content
#     except Exception as e:
#         error_msg = str(e)
#         if "api_key" in error_msg.lower() or "authentication" in error_msg.lower():
#             return "API key error. Please check your GROQ_API_KEY in the .env file."
#         elif "rate_limit" in error_msg.lower():
#             return "Rate limit reached. Please wait a moment and try again."
#         else:
#             return f"AI service unavailable. Error: {error_msg[:100]}"


# def generate_auto_insights(context, industry_context=""):
#     system = build_system_prompt(context, industry_context)
#     prompt = """Based on the business data, generate a business diagnostic report.
    
# Include:
# 1. Performance Summary (2-3 sentences)
# 2. Top 3 Strengths
# 3. Top 3 Issues or Risks
# 4. Top 3 Actionable Recommendations
# 5. Short-term Outlook

# Be specific, use numbers, keep it executive-level."""

#     messages = [
#         {"role": "system", "content": system},
#         {"role": "user", "content": prompt}
#     ]
#     return ask_ai_chat(messages, max_tokens=800)


# def generate_weekly_report(context, industry_context=""):
#     system = build_system_prompt(context, industry_context)
#     prompt = """Generate a Weekly Business Performance Report with:
# - Executive Summary
# - Key Metrics
# - What is Working Well
# - Areas of Concern
# - Recommended Actions This Week
# - Forecast for Next Period

# Keep it professional and data-driven."""

#     messages = [
#         {"role": "system", "content": system},
#         {"role": "user", "content": prompt}
#     ]
#     return ask_ai_chat(messages, max_tokens=1000)


# def answer_with_context(question, context, conversation_history, industry_context=""):
#     system = build_system_prompt(context, industry_context)
#     messages = [{"role": "system", "content": system}]
#     messages += conversation_history
#     messages.append({"role": "user", "content": question})
#     return ask_ai_chat(messages, max_tokens=600)





import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def get_groq_client():
    """Create Groq client safely without proxy issues."""
    try:
        from groq import Groq
        return Groq(api_key=GROQ_API_KEY)
    except TypeError:
        # Older groq version fix
        import groq
        client = object.__new__(groq.Groq)
        client.__dict__['api_key'] = GROQ_API_KEY
        return groq.Groq.__init__(client, api_key=GROQ_API_KEY) or client


def ask_ai_chat(messages, max_tokens=600):
    """Call Groq API with full message history."""
    try:
        from groq import Groq
        import httpx

        # This works for ALL groq versions
        client = Groq(
            api_key=GROQ_API_KEY,
            http_client=httpx.Client(
                timeout=30.0,
                follow_redirects=True
            )
        )

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
            max_tokens=max_tokens
        )
        return response.choices[0].message.content

    except Exception as e:
        error_msg = str(e)
        print(f"Groq error: {error_msg}")

        # Fallback: try without http_client
        try:
            from groq import Groq
            client = Groq(api_key=GROQ_API_KEY)
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=messages,
                temperature=0.7,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
        except Exception as e2:
            return f"AI Error: {str(e2)[:150]}"


def build_system_prompt(context, industry_context=""):
    return f"""You are an expert AI Business Analyst and Strategic Advisor.
{industry_context}

Analyze the business data below and give clear, actionable insights.
Always use specific numbers from the data in your answers.
Be concise, professional, and helpful.

Business Data:
{context}
"""


def generate_auto_insights(context, industry_context=""):
    messages = [
        {"role": "system", "content": build_system_prompt(context, industry_context)},
        {"role": "user", "content": """Analyze this business data and give me:
1. Performance Summary (2-3 sentences)
2. Top 3 Strengths
3. Top 3 Risks or Issues
4. Top 3 Recommendations
Use specific numbers. Keep it executive-level."""}
    ]
    return ask_ai_chat(messages, max_tokens=800)


def generate_weekly_report(context, industry_context=""):
    messages = [
        {"role": "system", "content": build_system_prompt(context, industry_context)},
        {"role": "user", "content": """Generate a Weekly Business Performance Report with:
- Executive Summary
- Key Metrics This Week
- What is Working Well
- Areas of Concern
- Recommended Actions
- Next Period Forecast"""}
    ]
    return ask_ai_chat(messages, max_tokens=1000)


def answer_with_context(question, context, conversation_history, industry_context=""):
    system = build_system_prompt(context, industry_context)
    messages = [{"role": "system", "content": system}]
    messages += conversation_history[-10:]  # last 10 messages only
    messages.append({"role": "user", "content": question})
    return ask_ai_chat(messages, max_tokens=600)