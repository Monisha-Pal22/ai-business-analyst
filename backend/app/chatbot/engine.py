# app/chatbot/engine.py
# AI response engine — handles both client and admin chat

import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# System prompts — different for client vs admin
CLIENT_PROMPT = """You are a friendly AI assistant for a Logistics company.
Your job is to:
- Answer questions about logistics services
- Help clients understand pricing and offerings
- Recommend suitable services based on their needs
- Help schedule meetings with the sales team
- Be professional, helpful, and concise

If asked something outside logistics, politely redirect back to logistics services."""

ADMIN_PROMPT = """You are an expert AI Business Analyst for a Logistics company.
You help internal management with:
- Business performance analysis
- Fleet utilization insights
- Cost optimization strategies
- Operational efficiency recommendations
- Revenue trends and forecasting
- Strategic business advice

Be analytical, data-driven, and give actionable insights."""


def get_ai_response(message: str, chat_type: str = "client", history: list = None) -> str:
    """
    Get AI response for a message.
    chat_type: 'client' for public chatbot, 'admin' for internal analytics chat
    history: list of previous messages for context
    """
    system_prompt = CLIENT_PROMPT if chat_type == "client" else ADMIN_PROMPT

    messages = [{"role": "system", "content": system_prompt}]

    # Add conversation history if provided
    if history:
        messages.extend(history)

    messages.append({"role": "user", "content": message})

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        return response.choices[0].message.content

    except Exception as e:
        return f"Sorry, I am unable to respond right now. Please try again. Error: {str(e)[:100]}"
