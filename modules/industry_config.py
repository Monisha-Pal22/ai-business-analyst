# modules/industry_config.py
# Industry-specific prompts and KPI guidance

INDUSTRY_PROMPTS = {
    "General / Retail": """
Focus on: Sales trends, profit margins, top products/categories, seasonal patterns.
Key metrics: Revenue, Profit, Orders, Margin %.
""",
    "Logistics": """
Focus on: Fleet utilization, delivery times, fuel costs, route efficiency, on-time rates.
Key metrics: Revenue per trip, Fuel cost %, Delivery success rate, Idle time.
""",
    "Finance": """
Focus on: Portfolio performance, ROI, risk exposure, liquidity, expense ratios.
Key metrics: Net Income, ROI %, Expense Ratio, Revenue growth.
""",
    "Real Estate": """
Focus on: Property performance, rental yields, occupancy rates, market trends.
Key metrics: Rental Income, Occupancy %, Yield %, Cost per unit.
""",
    "Marketing & Advertising": """
Focus on: Campaign ROI, lead conversion, customer acquisition cost, channel performance.
Key metrics: Revenue from campaigns, Ad Spend, ROI %, Lead Conversion %.
""",
    "Oil & Energy": """
Focus on: Production efficiency, supply chain cost, demand forecasting, downtime.
Key metrics: Output volume, Production cost, Revenue/barrel, Downtime %.
""",
    "Manufacturing": """
Focus on: Units produced, defect rates, COGS, production efficiency, waste.
Key metrics: Revenue, COGS, Defect Rate %, Units Produced, Efficiency %.
""",
    "E-commerce": """
Focus on: Order volume, return rates, average order value, conversion, logistics cost.
Key metrics: Sales, Orders, Return Rate %, Average Order Value, Profit Margin.
""",
}

SUGGESTED_QUESTIONS = {
    "General / Retail": [
        "Which category is most profitable?",
        "What is the sales trend over the last 6 months?",
        "Where are we losing profit?",
    ],
    "Logistics": [
        "Which routes are most cost-efficient?",
        "What is driving fuel cost increases?",
        "How can we improve delivery performance?",
    ],
    "Finance": [
        "What is our ROI trend?",
        "Where are the biggest expense areas?",
        "What are the top risks in our portfolio?",
    ],
    "Real Estate": [
        "Which properties have the best rental yield?",
        "What is our average occupancy rate?",
        "How can we optimize rental income?",
    ],
    "Marketing & Advertising": [
        "Which campaign gave the best ROI?",
        "What is our customer acquisition cost?",
        "Where should we increase ad spend?",
    ],
    "Oil & Energy": [
        "What is our production efficiency this month?",
        "Where are the biggest cost overruns?",
        "How does demand compare to supply?",
    ],
    "Manufacturing": [
        "What is our defect rate trend?",
        "How can we reduce COGS?",
        "Which product line is most efficient?",
    ],
    "E-commerce": [
        "What is our return rate and why?",
        "Which products have highest margins?",
        "How can we reduce cart abandonment?",
    ],
}


def get_industry_prompt(industry):
    return INDUSTRY_PROMPTS.get(industry, INDUSTRY_PROMPTS["General / Retail"])


def get_suggested_questions(industry):
    return SUGGESTED_QUESTIONS.get(industry, SUGGESTED_QUESTIONS["General / Retail"])
