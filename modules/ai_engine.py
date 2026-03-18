# modules/ai_engine.py
# LLM reasoning layer - handles all AI conversations

import os
from dotenv import load_dotenv
from groq import Groq
from config.settings import GROQ_API_KEY, GROQ_MODEL, MAX_TOKENS, TEMPERATURE

load_dotenv()
groq_client = None


def get_groq_client():
    """Lazily initialize Groq client on first use."""
    global groq_client
    if groq_client is None:
        if not GROQ_API_KEY:
            raise ValueError(
                "GROQ_API_KEY is not set. Please add it to your .env file or set it as an environment variable."
            )
        groq_client = Groq(api_key=GROQ_API_KEY)
    return groq_client


def build_system_prompt(industry, context):
    """Build a detailed system prompt with business context."""
    return f"""You are an expert AI Business Analyst and Advisor specializing in {industry}.

You have access to the following business data analysis:
{context}

Your role:
- Answer business questions clearly and concisely
- Provide data-driven insights and recommendations
- Identify risks, opportunities, and inefficiencies
- Give strategic advice tailored to {industry} industry
- Always reference the actual numbers from the data
- Keep responses structured with bullet points when listing items
- Be direct and actionable

Never say you don't have access to data — use the context provided above.
"""


def ask_ai(messages):
    """
    Send full conversation history to Groq LLM and get a response.
    messages = [{"role": "system/user/assistant", "content": "..."}]
    """
    try:
        client = get_groq_client()
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS,
        )
        return response.choices[0].message.content

    except Exception as e:
        return f"⚠️ AI Error: {str(e)[:200]}. Please check your API key or try again."


def generate_auto_insights(context, industry):
    """
    Auto-generate proactive business insights without user asking.
    Used for the automated diagnostics feature.
    """
    messages = [
        {
            "role": "system",
            "content": build_system_prompt(industry, context)
        },
        {
            "role": "user",
            "content": """Analyze this business data and provide:
1. Top 3 key findings
2. Top 2 risks or concerns
3. Top 3 actionable recommendations
Keep each point to 1-2 sentences. Be specific with numbers."""
        }
    ]
    return ask_ai(messages)


def generate_weekly_report(context, industry):
    """Generate a structured weekly performance report."""
    messages = [
        {
            "role": "system",
            "content": build_system_prompt(industry, context)
        },
        {
            "role": "user",
            "content": """Generate a Weekly Business Performance Report with these sections:
1. Executive Summary (2-3 sentences)
2. Financial Performance
3. Key Wins This Period
4. Areas of Concern
5. Recommendations for Next Week
Format it clearly with headers."""
        }
    ]
    return ask_ai(messages)
