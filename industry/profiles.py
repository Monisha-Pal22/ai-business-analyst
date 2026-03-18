# industry/profiles.py
# Industry-specific prompts, KPIs, and analysis configurations

INDUSTRY_PROFILES = {

    "Retail / E-commerce": {
        "icon": "🛒",
        "key_metrics": ["Sales", "Profit", "Orders", "Customer Count", "Return Rate"],
        "focus_areas": ["Category performance", "Seasonal trends", "Customer acquisition cost"],
        "typical_questions": [
            "Which product category is most profitable?",
            "What are the seasonal sales patterns?",
            "Which region has the highest customer acquisition cost?",
            "What is the average order value trend?"
        ],
        "system_context": """You are an expert Retail & E-commerce Business Analyst. 
        Focus on: product performance, customer behavior, seasonal trends, 
        inventory optimization, and marketing ROI."""
    },

    "Logistics": {
        "icon": "🚛",
        "key_metrics": ["Fleet Utilization", "Delivery Cost", "Route Efficiency", "Fuel Cost"],
        "focus_areas": ["Route optimization", "Fleet utilization", "Fuel cost analysis"],
        "typical_questions": [
            "Which routes are most cost-efficient?",
            "How can we reduce fuel costs?",
            "Which fleet vehicles are underperforming?",
            "What is our on-time delivery rate?"
        ],
        "system_context": """You are an expert Logistics & Supply Chain Business Analyst.
        Focus on: fleet utilization, route efficiency, delivery costs, 
        fuel optimization, and supply chain performance."""
    },

    "Finance": {
        "icon": "💰",
        "key_metrics": ["Revenue", "Net Profit", "ROI", "Cash Flow", "Expense Ratio"],
        "focus_areas": ["Revenue trends", "Cost centers", "Profit margins", "Risk exposure"],
        "typical_questions": [
            "What are the main cost drivers?",
            "Which business unit has the best ROI?",
            "Where are we losing money?",
            "What is our revenue growth trend?"
        ],
        "system_context": """You are an expert Financial Business Analyst.
        Focus on: profit & loss analysis, cost optimization, revenue growth,
        cash flow management, and financial risk assessment."""
    },

    "Real Estate": {
        "icon": "🏢",
        "key_metrics": ["Property Value", "Rental Yield", "Occupancy Rate", "ROI"],
        "focus_areas": ["Property performance", "Rental yield", "Market trends"],
        "typical_questions": [
            "Which properties have the best rental yield?",
            "What is the occupancy rate trend?",
            "Which locations show highest appreciation?",
            "How can we optimize property portfolio performance?"
        ],
        "system_context": """You are an expert Real Estate Business Analyst.
        Focus on: property performance, rental yields, occupancy rates,
        market trends, and portfolio optimization."""
    },

    "Marketing & Advertising": {
        "icon": "📣",
        "key_metrics": ["Campaign ROI", "Lead Conversion", "Customer Acquisition Cost", "Reach"],
        "focus_areas": ["Campaign performance", "Channel ROI", "Lead quality"],
        "typical_questions": [
            "Which marketing channel has the best ROI?",
            "What is our customer acquisition cost by channel?",
            "Which campaigns are underperforming?",
            "How can we improve lead conversion rates?"
        ],
        "system_context": """You are an expert Marketing & Advertising Business Analyst.
        Focus on: campaign ROI, channel performance, lead conversion,
        customer acquisition costs, and marketing spend optimization."""
    },

    "Oil & Energy": {
        "icon": "⚡",
        "key_metrics": ["Production Volume", "Cost per Unit", "Efficiency Rate", "Demand Forecast"],
        "focus_areas": ["Production efficiency", "Cost analysis", "Demand forecasting"],
        "typical_questions": [
            "What is our production efficiency rate?",
            "Where are the highest operational costs?",
            "What is the demand forecast for next quarter?",
            "How can we reduce production costs?"
        ],
        "system_context": """You are an expert Oil & Energy Business Analyst.
        Focus on: production efficiency, operational costs, supply chain,
        energy demand forecasting, and resource optimization."""
    },

    "Manufacturing": {
        "icon": "🏭",
        "key_metrics": ["Production Output", "Defect Rate", "Unit Cost", "Machine Utilization"],
        "focus_areas": ["Production efficiency", "Quality control", "Cost per unit"],
        "typical_questions": [
            "Which production line is least efficient?",
            "What is our defect rate trend?",
            "How can we reduce cost per unit?",
            "Which machines need maintenance based on output data?"
        ],
        "system_context": """You are an expert Manufacturing Business Analyst.
        Focus on: production efficiency, quality control, cost per unit,
        machine utilization, and operational improvements."""
    },

    "General Business": {
        "icon": "📊",
        "key_metrics": ["Revenue", "Profit", "Orders", "Growth Rate"],
        "focus_areas": ["Overall performance", "Trends", "Opportunities"],
        "typical_questions": [
            "How is the business performing overall?",
            "What are the main growth opportunities?",
            "Where should we focus to improve profitability?",
            "What risks should we be aware of?"
        ],
        "system_context": """You are an expert Business Analyst and Strategic Advisor.
        Focus on: overall business performance, growth opportunities,
        risk identification, and strategic recommendations."""
    }
}


def get_industry_profile(industry_name):
    """Get profile for a specific industry."""
    return INDUSTRY_PROFILES.get(industry_name, INDUSTRY_PROFILES["General Business"])


def get_industry_list():
    """Return list of all supported industries."""
    return list(INDUSTRY_PROFILES.keys())


def get_starter_questions(industry_name):
    """Get sample questions for an industry."""
    profile = get_industry_profile(industry_name)
    return profile.get("typical_questions", [])
