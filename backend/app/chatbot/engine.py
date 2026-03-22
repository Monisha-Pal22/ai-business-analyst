# app/chatbot/engine.py
# AI response engine — handles both client and admin chat

import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# System prompts — different for client vs admin
CLIENT_PROMPT = """You are a friendly and professional AI assistant for a Logistics company called LogiAI.

Your job is to help clients with:
1. SERVICE QUERIES — When asked about services, list them clearly with prices
2. SERVICE BOOKING — Help clients book or enquire about a service
3. MEETING BOOKING — Help clients schedule a meeting with our team
4. USER DATA GATHERING — Naturally collect name, email, company, requirements
5. ADDITIONAL INFO — Provide helpful details about logistics, delivery, warehousing
6. CONVERSATION — Be warm, friendly, and human-like

Our services:
- Express Delivery: Same-day and next-day delivery. From $49/shipment
- Warehouse Storage: Secure short and long-term storage. From $299/month
- Fleet Tracking: Real-time GPS and route optimization. From $199/month

When user asks about services, respond with this EXACT format so the frontend can show cards:
[SERVICES_CARD]

When user wants to book a meeting, ask for their name, email, and preferred time.
When collecting user info, ask one question at a time naturally.
Always end responses with a helpful follow-up question.
Keep responses short, friendly, and conversational."""
# """You are a friendly AI assistant for a Logistics company.
# # Your job is to:
# # - Answer questions about logistics services
# # - Help clients understand pricing and offerings
# # - Recommend suitable services based on their needs
# # - Help schedule meetings with the sales team
# # - Be professional, helpful, and concise

# # If asked something outside logistics, politely redirect back to logistics services."""


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


