# # app/analytics/engine.py
# # Logistics KPI analytics — reused and extended from previous project

# from fastapi import APIRouter
# import random   # replace with real DB queries later

# router = APIRouter()


# def get_logistics_kpis() -> dict:
#     """
#     Returns key logistics KPIs.
#     In production — replace with real database queries.
#     """
#     return {
#         "fleet_utilization":      "78%",
#         "on_time_delivery_rate":  "91%",
#         "avg_delivery_time_hrs":  4.2,
#         "fuel_cost_this_month":   "$12,450",
#         "total_shipments":        342,
#         "delayed_shipments":      31,
#         "cost_per_shipment":      "$36.40",
#         "warehouse_throughput":   "94%",
#         "driver_productivity":    "87%",
#     }


# def get_weekly_summary() -> str:
#     """Returns a text summary for the weekly report."""
#     kpis = get_logistics_kpis()
#     return f"""
# Weekly Logistics Performance Summary:

# - Fleet Utilization: {kpis['fleet_utilization']}
# - On-Time Delivery Rate: {kpis['on_time_delivery_rate']}
# - Total Shipments: {kpis['total_shipments']}
# - Delayed Shipments: {kpis['delayed_shipments']}
# - Average Delivery Time: {kpis['avg_delivery_time_hrs']} hours
# - Fuel Cost: {kpis['fuel_cost_this_month']}
# - Cost Per Shipment: {kpis['cost_per_shipment']}
# - Warehouse Throughput: {kpis['warehouse_throughput']}
# """


# @router.get("/kpis")
# def logistics_kpis():
#     """API endpoint — returns logistics KPIs for admin dashboard."""
#     return get_logistics_kpis()


# @router.get("/weekly-summary")
# def weekly_summary():
#     """API endpoint — returns weekly text summary."""
#     return {"summary": get_weekly_summary()}



# app/analytics/engine.py
# UPGRADED — real DB queries, route efficiency metric, monthly report endpoint

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from app.database.models import Meeting, ChatLog, RouteMetric
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


# ── Real KPIs from database ───────────────────────────────
def get_logistics_kpis(db: Session) -> dict:
    """
    Returns logistics KPIs pulled from the real database.
    Falls back to 0 / N/A if no data exists yet.
    """
    now   = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # ── Meetings / shipments (from meetings table) ────────
    total_shipments   = db.query(Meeting).count()
    delayed_shipments = db.query(Meeting).filter(Meeting.status == "cancelled").count()
    on_time           = total_shipments - delayed_shipments
    on_time_rate      = round((on_time / total_shipments * 100), 1) if total_shipments > 0 else 0

    # ── Route metrics ─────────────────────────────────────
    all_routes = db.query(RouteMetric).all()

    total_routes      = len(all_routes)
    route_efficiencies = [r.efficiency_pct for r in all_routes if r.efficiency_pct > 0]
    avg_route_eff     = round(sum(route_efficiencies) / len(route_efficiencies), 1) if route_efficiencies else 0

    avg_actual_hrs    = db.query(func.avg(RouteMetric.actual_duration_hrs)).scalar() or 0
    total_fuel        = db.query(func.sum(RouteMetric.fuel_used_liters)).scalar() or 0

    # ── Chat activity (proxy for client engagement) ───────
    total_chats = db.query(ChatLog).filter(ChatLog.chat_type == "client").count()

    return {
        # Delivery
        "total_shipments":       total_shipments,
        "delayed_shipments":     delayed_shipments,
        "on_time_delivery_rate": f"{on_time_rate}%",
        "avg_delivery_time_hrs": round(float(avg_actual_hrs), 2),

        # Route efficiency — NEW metric
        "route_efficiency":      f"{avg_route_eff}%",
        "total_routes_tracked":  total_routes,

        # Fuel & cost (from route metrics)
        "fuel_used_liters_total": round(float(total_fuel), 1),

        # Client engagement
        "total_client_chats": total_chats,

        # Static operational KPIs (replace with real tables when fleet DB is connected)
        "fleet_utilization":   "78%",
        "warehouse_throughput": "94%",
        "driver_productivity":  "87%",
        "cost_per_shipment":    "$36.40",
    }


# ── Weekly summary ────────────────────────────────────────
def get_weekly_summary(db: Session) -> str:
    kpis = get_logistics_kpis(db)
    week_ago = datetime.utcnow() - timedelta(days=7)

    weekly_chats    = db.query(ChatLog).filter(
        ChatLog.chat_type == "client",
        ChatLog.timestamp >= week_ago
    ).count()

    weekly_meetings = db.query(Meeting).filter(
        Meeting.created_at >= week_ago
    ).count()

    return f"""
Weekly Logistics Performance Summary
Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}

Deliveries
- Total Shipments: {kpis['total_shipments']}
- Delayed: {kpis['delayed_shipments']}
- On-Time Rate: {kpis['on_time_delivery_rate']}
- Avg Delivery Time: {kpis['avg_delivery_time_hrs']} hrs

Route Efficiency
- Route Efficiency: {kpis['route_efficiency']}
- Routes Tracked: {kpis['total_routes_tracked']}
- Total Fuel Used: {kpis['fuel_used_liters_total']} L

Operations
- Fleet Utilization: {kpis['fleet_utilization']}
- Warehouse Throughput: {kpis['warehouse_throughput']}
- Driver Productivity: {kpis['driver_productivity']}
- Cost Per Shipment: {kpis['cost_per_shipment']}

Client Activity (Last 7 Days)
- New Chat Sessions: {weekly_chats}
- New Meeting Bookings: {weekly_meetings}
"""


# ── Monthly summary — NEW ─────────────────────────────────
def get_monthly_summary(db: Session) -> str:
    kpis = get_logistics_kpis(db)
    month_ago   = datetime.utcnow() - timedelta(days=30)
    month_label = datetime.utcnow().strftime('%B %Y')

    monthly_meetings = db.query(Meeting).filter(
        Meeting.created_at >= month_ago
    ).count()

    completed_meetings = db.query(Meeting).filter(
        Meeting.created_at >= month_ago,
        Meeting.status == "completed"
    ).count()

    monthly_chats = db.query(ChatLog).filter(
        ChatLog.chat_type == "client",
        ChatLog.timestamp >= month_ago
    ).count()

    monthly_routes = db.query(RouteMetric).filter(
        RouteMetric.recorded_at >= month_ago
    ).all()

    monthly_fuel = sum(r.fuel_used_liters or 0 for r in monthly_routes)
    monthly_route_effs = [r.efficiency_pct for r in monthly_routes if r.efficiency_pct > 0]
    monthly_route_avg  = round(sum(monthly_route_effs) / len(monthly_route_effs), 1) if monthly_route_effs else 0

    return f"""
Monthly Logistics Performance Report — {month_label}
Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}

Fleet Performance
- Fleet Utilization: {kpis['fleet_utilization']}
- Driver Productivity: {kpis['driver_productivity']}
- Routes Completed: {len(monthly_routes)}
- Avg Route Efficiency: {monthly_route_avg}%

Warehouse Efficiency
- Warehouse Throughput: {kpis['warehouse_throughput']}
- Cost Per Shipment: {kpis['cost_per_shipment']}

Route Optimization Insights
- Total Fuel Used: {round(monthly_fuel, 1)} L
- On-Time Delivery Rate: {kpis['on_time_delivery_rate']}
- Avg Delivery Time: {kpis['avg_delivery_time_hrs']} hrs

Client Engagement (Last 30 Days)
- Meeting Bookings: {monthly_meetings}
- Meetings Completed: {completed_meetings}
- Client Chat Sessions: {monthly_chats}
"""


# ── API Endpoints ─────────────────────────────────────────

@router.get("/kpis")
def logistics_kpis(db: Session = Depends(get_db)):
    """Returns all logistics KPIs — pulled from real DB."""
    return get_logistics_kpis(db)


@router.get("/weekly-summary")
def weekly_summary(db: Session = Depends(get_db)):
    """Returns the weekly performance text report."""
    return {"summary": get_weekly_summary(db)}


@router.get("/monthly-summary")
def monthly_summary(db: Session = Depends(get_db)):
    """NEW — Returns the monthly performance text report."""
    return {"summary": get_monthly_summary(db)}


# ── Route metrics CRUD (for seeding / real data input) ────

class RouteMetricIn(BaseModel if True else None):
    pass

from pydantic import BaseModel
from typing import Optional

class RouteMetricCreate(BaseModel):
    route_name:           str
    distance_km:          Optional[float] = None
    planned_duration_hrs: Optional[float] = None
    actual_duration_hrs:  Optional[float] = None
    fuel_used_liters:     Optional[float] = None
    on_time:              Optional[bool]  = True
    driver_name:          Optional[str]   = None
    vehicle_id:           Optional[str]   = None


@router.post("/route-metrics")
def add_route_metric(data: RouteMetricCreate, db: Session = Depends(get_db)):
    """Add a real route record — feeds route efficiency analytics."""
    metric = RouteMetric(**data.dict())
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return {"message": "Route metric saved", "id": metric.id, "efficiency": metric.efficiency_pct}


@router.get("/route-metrics")
def get_route_metrics(limit: int = 50, db: Session = Depends(get_db)):
    """Get recent route metrics."""
    metrics = db.query(RouteMetric).order_by(RouteMetric.recorded_at.desc()).limit(limit).all()
    return [
        {
            "id":             m.id,
            "route_name":     m.route_name,
            "distance_km":    m.distance_km,
            "planned_hrs":    m.planned_duration_hrs,
            "actual_hrs":     m.actual_duration_hrs,
            "efficiency_pct": m.efficiency_pct,
            "fuel_liters":    m.fuel_used_liters,
            "on_time":        m.on_time,
            "driver":         m.driver_name,
            "vehicle_id":     m.vehicle_id,
            "recorded_at":    m.recorded_at,
        }
        for m in metrics
    ]