from ortools.sat.python import cp_model
from app.schemas.schemas import MatchResult

def generate_schedule(matches: list[MatchResult], num_slots: int = 10, max_meetings_per_startup: int = 5, max_meetings_per_investor: int = 5):
    """
    Schedules meetings using OR-Tools CP-SAT solver.
    """
    model = cp_model.CpModel()
    
    startups = list(set(m.startup_id for m in matches))
    investors = list(set(m.investor_id for m in matches))
    
    meeting_vars = {}
    
    for match in matches:
        s = match.startup_id
        i = match.investor_id
        for t in range(num_slots):
            meeting_vars[(s, i, t)] = model.NewBoolVar(f'meet_{s}_{i}_{t}')
            
    # 1. No overlapping meetings for a startup
    for s in startups:
        for t in range(num_slots):
            model.AddAtMostOne([meeting_vars[(s, m.investor_id, t)] for m in matches if m.startup_id == s])
            
    # 2. No overlapping meetings for an investor
    for i in investors:
        for t in range(num_slots):
            model.AddAtMostOne([meeting_vars[(m.startup_id, i, t)] for m in matches if m.investor_id == i])
            
    # 3. Startup meets investor AT MOST once
    for match in matches:
        s = match.startup_id
        i = match.investor_id
        model.AddAtMostOne([meeting_vars[(s, i, t)] for t in range(num_slots)])
        
    # 4. Max meetings per startup
    for s in startups:
        model.Add(sum(meeting_vars[(s, m.investor_id, t)] for m in matches if m.startup_id == s for t in range(num_slots)) <= max_meetings_per_startup)
        
    # 5. Max meetings per investor
    for i in investors:
        model.Add(sum(meeting_vars[(m.startup_id, i, t)] for m in matches if m.investor_id == i for t in range(num_slots)) <= max_meetings_per_investor)
        
    # Objective: Maximize total match score
    objective_terms = []
    for match in matches:
        s = match.startup_id
        i = match.investor_id
        weight = int(match.final_score * 100)
        for t in range(num_slots):
            objective_terms.append(weight * meeting_vars[(s, i, t)])
            
    model.Maximize(sum(objective_terms))
    
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 10.0
    status = solver.Solve(model)
    
    schedule = []
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        for match in matches:
            s = match.startup_id
            i = match.investor_id
            for t in range(num_slots):
                if solver.Value(meeting_vars[(s, i, t)]):
                    schedule.append({
                        "startup_id": s,
                        "investor_id": i,
                        "time_slot": t,
                        "match_score": match.final_score,
                        "match_id": match.id,
                    })
                    
    return schedule
