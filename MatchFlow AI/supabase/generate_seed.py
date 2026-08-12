import uuid
import json
import random

def generate_seed():
    startups = []
    investors = []
    users = []

    # Roles
    ROLES = ['startup', 'investor', 'organizer']

    # Generate Organizer
    org_id = str(uuid.uuid4())
    users.append(f"INSERT INTO users (id, role, email) VALUES ('{org_id}', 'organizer', 'admin@matchflow.ai');")

    # The Canonical Startup
    canonical_startup_user_id = str(uuid.uuid4())
    canonical_startup_id = str(uuid.uuid4())
    users.append(f"INSERT INTO users (id, role, email) VALUES ('{canonical_startup_user_id}', 'startup', 'founder@logisense.ai');")
    startups.append(f"INSERT INTO startups (id, user_id, company_name) VALUES ('{canonical_startup_id}', '{canonical_startup_user_id}', 'LogiSense AI');")
    
    # We leave embedding NULL for now, we will compute it at runtime or mock it.
    startup_profiles = []
    startup_profiles.append(f"""
INSERT INTO startup_profiles (startup_id, description, industry, stage, funding_requirement, business_model, target_market, geography, technology, traction, revenue_status)
VALUES ('{canonical_startup_id}', 'B2B Logistics SaaS optimizing delivery routes with AI.', 'Logistics', 'Seed', 500000, 'B2B SaaS', 'Logistics Providers', 'Southeast Asia', 'AI, Optimization', '20 paying customers', 'Early Revenue');
""")

    # Generate 19 more startups
    industries = ['Fintech', 'Healthtech', 'Edtech', 'E-commerce', 'SaaS', 'Proptech', 'Agtech']
    stages = ['Pre-Seed', 'Seed', 'Series A', 'Series B']
    geographies = ['Southeast Asia', 'North America', 'Europe', 'Global']
    
    for i in range(19):
        s_uid = str(uuid.uuid4())
        s_id = str(uuid.uuid4())
        users.append(f"INSERT INTO users (id, role, email) VALUES ('{s_uid}', 'startup', 'startup{i}@example.com');")
        startups.append(f"INSERT INTO startups (id, user_id, company_name) VALUES ('{s_id}', '{s_uid}', 'Startup {i} Inc');")
        
        ind = random.choice(industries)
        stg = random.choice(stages)
        fund = random.randint(100, 5000) * 1000
        geo = random.choice(geographies)
        
        startup_profiles.append(f"""
INSERT INTO startup_profiles (startup_id, description, industry, stage, funding_requirement, business_model, target_market, geography, technology, traction, revenue_status)
VALUES ('{s_id}', 'An innovative {ind} company doing great things.', '{ind}', '{stg}', {fund}, 'B2B', 'Global', '{geo}', 'Cloud', 'Pre-revenue', 'Idea');
""")

    # Generate Canonical Investor (ABC Ventures)
    canonical_inv_user_id = str(uuid.uuid4())
    canonical_inv_id = str(uuid.uuid4())
    users.append(f"INSERT INTO users (id, role, email) VALUES ('{canonical_inv_user_id}', 'investor', 'partner@abcventures.vc');")
    investors.append(f"INSERT INTO investors (id, user_id, investor_name) VALUES ('{canonical_inv_id}', '{canonical_inv_user_id}', 'ABC Ventures');")

    inv_profiles = []
    inv_profiles.append(f"""
INSERT INTO investor_profiles (investor_id, investment_thesis, preferred_industries, preferred_stages, min_ticket_size, max_ticket_size, preferred_geographies, business_model_preferences, technology_interests)
VALUES ('{canonical_inv_id}', 'Investing in early stage B2B SaaS and supply-chain tech.', ARRAY['Logistics', 'SaaS'], ARRAY['Seed', 'Series A'], 300000, 2000000, ARRAY['Southeast Asia'], ARRAY['B2B SaaS'], ARRAY['AI']);
""")

    # Generate 9 more investors
    for i in range(9):
        i_uid = str(uuid.uuid4())
        i_id = str(uuid.uuid4())
        users.append(f"INSERT INTO users (id, role, email) VALUES ('{i_uid}', 'investor', 'investor{i}@fund.com');")
        investors.append(f"INSERT INTO investors (id, user_id, investor_name) VALUES ('{i_id}', '{i_uid}', 'Fund {i} Partners');")
        
        pref_ind = [random.choice(industries), random.choice(industries)]
        pref_stg = [random.choice(stages)]
        geo = [random.choice(geographies)]
        min_t = random.randint(50, 500) * 1000
        max_t = min_t + random.randint(500, 5000) * 1000
        
        inv_profiles.append(f"""
INSERT INTO investor_profiles (investor_id, investment_thesis, preferred_industries, preferred_stages, min_ticket_size, max_ticket_size, preferred_geographies, business_model_preferences, technology_interests)
VALUES ('{i_id}', 'Generalist fund looking for high growth.', ARRAY{pref_ind}, ARRAY{pref_stg}, {min_t}, {max_t}, ARRAY{geo}, ARRAY['B2B', 'B2C'], ARRAY['Web3', 'AI']);
""")

    with open('seed.sql', 'w') as f:
        f.write("-- MatchFlow AI Seed Data\n\n")
        f.write("\n".join(users) + "\n\n")
        f.write("\n".join(startups) + "\n\n")
        f.write("\n".join(startup_profiles) + "\n\n")
        f.write("\n".join(investors) + "\n\n")
        f.write("\n".join(inv_profiles) + "\n\n")
        
        # Availability slots (5 slots)
        slots = []
        for i in range(5):
            h = 9 + (i // 2)
            m = '00' if i % 2 == 0 else '30'
            m2 = '30' if i % 2 == 0 else '00'
            h2 = h if i % 2 == 0 else h + 1
            slots.append(f"INSERT INTO availability_slots (start_time, end_time) VALUES ('2026-10-10 {h:02d}:{m}:00Z', '2026-10-10 {h2:02d}:{m2}:00Z');")
        f.write("\n".join(slots) + "\n\n")
        print("Generated seed.sql successfully.")

if __name__ == '__main__':
    generate_seed()
