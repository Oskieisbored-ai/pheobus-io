"""Seed the database with realistic demo data for development and production."""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

# Load .env if present (dev)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User, Workspace
from app.models.contact import Contact
from app.models.company import Company
from app.models.list import ContactList, ListMember
from app.models.sequence import Sequence, SequenceStep

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        print("Database already seeded. Skipping.")
        db.close()
        return

    print("Seeding database...")

    # Create workspace
    workspace = Workspace(name="Pheobus Demo")
    db.add(workspace)
    db.flush()

    # Create admin user
    user = User(
        email="wcastrooj@gmail.com",
        password_hash=hash_password("Ojcc1993$"),
        first_name="William",
        last_name="Castro",
        role="admin",
        workspace_id=workspace.id,
    )
    db.add(user)
    db.flush()

    # Create companies
    companies_data = [
        {
            "name": "Stripe", "domain": "stripe.com", "industry": "Financial Technology",
            "employee_range": "5001-10000", "employee_count": 8000,
            "headquarters_city": "San Francisco", "headquarters_state": "California",
            "headquarters_country": "United States", "founded_year": 2010,
            "description": "Financial infrastructure for the internet.",
            "tech_stack": ["React", "Ruby", "Go", "AWS"],
            "website_url": "https://stripe.com", "linkedin_url": "https://linkedin.com/company/stripe",
            "revenue_range": "$1B+", "total_funding": 8700000000,
        },
        {
            "name": "Notion", "domain": "notion.so", "industry": "Software",
            "employee_range": "501-1000", "employee_count": 800,
            "headquarters_city": "San Francisco", "headquarters_state": "California",
            "headquarters_country": "United States", "founded_year": 2013,
            "description": "The all-in-one workspace for notes, docs, and collaboration.",
            "tech_stack": ["React", "TypeScript", "Node.js", "PostgreSQL"],
            "website_url": "https://notion.so", "linkedin_url": "https://linkedin.com/company/notionhq",
            "revenue_range": "$100M-$500M",
        },
        {
            "name": "Figma", "domain": "figma.com", "industry": "Design Software",
            "employee_range": "1001-5000", "employee_count": 1500,
            "headquarters_city": "San Francisco", "headquarters_state": "California",
            "headquarters_country": "United States", "founded_year": 2012,
            "description": "The collaborative interface design tool.",
            "tech_stack": ["TypeScript", "C++", "WebAssembly", "React"],
            "website_url": "https://figma.com", "linkedin_url": "https://linkedin.com/company/figma",
        },
        {
            "name": "Vercel", "domain": "vercel.com", "industry": "Cloud Platform",
            "employee_range": "501-1000", "employee_count": 600,
            "headquarters_city": "San Francisco", "headquarters_state": "California",
            "headquarters_country": "United States", "founded_year": 2015,
            "description": "Develop. Preview. Ship. The frontend cloud.",
            "tech_stack": ["Next.js", "React", "Go", "Rust"],
            "website_url": "https://vercel.com", "linkedin_url": "https://linkedin.com/company/vercel",
        },
        {
            "name": "Linear", "domain": "linear.app", "industry": "Project Management",
            "employee_range": "51-200", "employee_count": 80,
            "headquarters_city": "San Francisco", "headquarters_state": "California",
            "headquarters_country": "United States", "founded_year": 2019,
            "description": "The issue tracking tool you'll enjoy using.",
            "tech_stack": ["React", "TypeScript", "Node.js", "PostgreSQL"],
            "website_url": "https://linear.app",
        },
        {
            "name": "Datadog", "domain": "datadoghq.com", "industry": "Cloud Monitoring",
            "employee_range": "5001-10000", "employee_count": 6500,
            "headquarters_city": "New York", "headquarters_state": "New York",
            "headquarters_country": "United States", "founded_year": 2010,
            "description": "Cloud-scale monitoring and security platform.",
            "tech_stack": ["Python", "Go", "React", "Kafka", "Cassandra"],
            "website_url": "https://datadoghq.com",
            "revenue_range": "$1B+",
        },
        {
            "name": "Plaid", "domain": "plaid.com", "industry": "Financial Technology",
            "employee_range": "1001-5000", "employee_count": 1800,
            "headquarters_city": "San Francisco", "headquarters_state": "California",
            "headquarters_country": "United States", "founded_year": 2013,
            "description": "The easier way for everyone to connect to their financial data.",
            "tech_stack": ["Python", "Go", "React", "AWS", "Kubernetes"],
            "website_url": "https://plaid.com",
        },
        {
            "name": "Revolut", "domain": "revolut.com", "industry": "Financial Technology",
            "employee_range": "5001-10000", "employee_count": 8000,
            "headquarters_city": "London", "headquarters_state": "England",
            "headquarters_country": "United Kingdom", "founded_year": 2015,
            "description": "One app for all things money.",
            "tech_stack": ["Java", "Kotlin", "React Native", "AWS"],
            "website_url": "https://revolut.com",
        },
        {
            "name": "Canva", "domain": "canva.com", "industry": "Design Software",
            "employee_range": "1001-5000", "employee_count": 4000,
            "headquarters_city": "Sydney", "headquarters_state": "NSW",
            "headquarters_country": "Australia", "founded_year": 2012,
            "description": "Empowering the world to design.",
            "tech_stack": ["Java", "TypeScript", "React", "AWS"],
            "website_url": "https://canva.com",
        },
        {
            "name": "Miro", "domain": "miro.com", "industry": "Collaboration Software",
            "employee_range": "1001-5000", "employee_count": 1800,
            "headquarters_city": "San Francisco", "headquarters_state": "California",
            "headquarters_country": "United States", "founded_year": 2011,
            "description": "The visual workspace for innovation.",
            "tech_stack": ["TypeScript", "React", "Java", "AWS"],
            "website_url": "https://miro.com",
        },
        # Construction
        {
            "name": "Bechtel", "domain": "bechtel.com", "industry": "Construction",
            "employee_range": "10001+", "employee_count": 55000,
            "headquarters_city": "San Francisco", "headquarters_state": "California",
            "headquarters_country": "United States", "founded_year": 1898,
            "description": "One of the largest construction and civil engineering companies in the world, delivering complex infrastructure projects across six continents.",
            "short_description": "Global infrastructure & construction giant",
            "tech_stack": ["SAP", "Primavera", "BIM 360", "Procore"],
            "website_url": "https://bechtel.com", "linkedin_url": "https://linkedin.com/company/bechtel",
            "revenue_range": "$1B+",
        },
        {
            "name": "Turner Construction", "domain": "turnerconstruction.com", "industry": "Construction",
            "employee_range": "10001+", "employee_count": 12000,
            "headquarters_city": "New York", "headquarters_state": "New York",
            "headquarters_country": "United States", "founded_year": 1902,
            "description": "North America's largest general builder, specializing in commercial buildings, healthcare facilities, and green building.",
            "short_description": "Leading US general contractor & builder",
            "tech_stack": ["Procore", "Bluebeam", "PlanGrid", "BIM"],
            "website_url": "https://turnerconstruction.com", "linkedin_url": "https://linkedin.com/company/turner-construction",
            "revenue_range": "$1B+",
        },
        {
            "name": "Skanska", "domain": "skanska.com", "industry": "Construction",
            "employee_range": "10001+", "employee_count": 30000,
            "headquarters_city": "New York", "headquarters_state": "New York",
            "headquarters_country": "United States", "founded_year": 1887,
            "description": "Global construction and development company building schools, hospitals, highways, and sustainable infrastructure.",
            "short_description": "Swedish-American construction multinational",
            "tech_stack": ["BIM 360", "Procore", "Trimble", "Microsoft Azure"],
            "website_url": "https://skanska.com",
            "revenue_range": "$1B+",
        },
        {
            "name": "Hensel Phelps", "domain": "henselphelps.com", "industry": "Construction",
            "employee_range": "1001-5000", "employee_count": 4300,
            "headquarters_city": "Denver", "headquarters_state": "Colorado",
            "headquarters_country": "United States", "founded_year": 1937,
            "description": "Employee-owned general contractor known for delivering complex building projects across aviation, healthcare, and government sectors.",
            "short_description": "Employee-owned US general contractor",
            "tech_stack": ["Procore", "Revit", "Navisworks"],
            "website_url": "https://henselphelps.com",
        },
        # Healthcare
        {
            "name": "Epic Systems", "domain": "epic.com", "industry": "Healthcare",
            "employee_range": "10001+", "employee_count": 13000,
            "headquarters_city": "Chicago", "headquarters_state": "Illinois",
            "headquarters_country": "United States", "founded_year": 1979,
            "description": "Electronic health records software used by hospitals and health systems serving over 250 million patients.",
            "short_description": "Dominant EHR software for hospitals",
            "tech_stack": ["M/MUMPS", "C#", ".NET", "Azure"],
            "website_url": "https://epic.com",
            "revenue_range": "$1B+",
        },
        # E-Commerce
        {
            "name": "Shopify", "domain": "shopify.com", "industry": "E-Commerce",
            "employee_range": "10001+", "employee_count": 12000,
            "headquarters_city": "Toronto", "headquarters_state": "Ontario",
            "headquarters_country": "Canada", "founded_year": 2006,
            "description": "Commerce platform powering millions of businesses with online stores, payments, and fulfillment.",
            "short_description": "E-commerce platform for online stores",
            "tech_stack": ["Ruby on Rails", "React", "Go", "Rust", "GCP"],
            "website_url": "https://shopify.com", "linkedin_url": "https://linkedin.com/company/shopify",
            "revenue_range": "$1B+", "total_funding": 122000000,
        },
        # Marketing
        {
            "name": "HubSpot", "domain": "hubspot.com", "industry": "Marketing",
            "employee_range": "5001-10000", "employee_count": 7600,
            "headquarters_city": "Boston", "headquarters_state": "Massachusetts",
            "headquarters_country": "United States", "founded_year": 2006,
            "description": "CRM platform with marketing, sales, customer service, and content management software.",
            "short_description": "Inbound marketing & CRM platform",
            "tech_stack": ["Java", "React", "Kafka", "HBase", "AWS"],
            "website_url": "https://hubspot.com", "linkedin_url": "https://linkedin.com/company/hubspot",
            "revenue_range": "$1B+",
        },
    ]

    company_objs = []
    for co_data in companies_data:
        co = Company(**co_data, source="seed")
        db.add(co)
        db.flush()
        company_objs.append(co)

    # Create contacts
    contacts_data = [
        # Stripe
        {"first_name": "Patrick", "last_name": "Collison", "title": "CEO", "seniority": "c_suite",
         "department": "executive", "email": "patrick@stripe.com", "email_status": "verified",
         "email_confidence": 0.95, "phone": "+1-415-555-0101", "city": "San Francisco",
         "state": "California", "country": "United States",
         "linkedin_url": "https://linkedin.com/in/patrickcollison", "company_idx": 0},
        {"first_name": "Claire", "last_name": "Hughes Johnson", "title": "Former COO", "seniority": "c_suite",
         "department": "operations", "email": "claire@stripe.com", "email_status": "unverified",
         "email_confidence": 0.7, "city": "San Francisco", "state": "California", "country": "United States",
         "company_idx": 0},
        {"first_name": "David", "last_name": "Singleton", "title": "CTO", "seniority": "c_suite",
         "department": "engineering", "email": "david.singleton@stripe.com", "email_status": "verified",
         "email_confidence": 0.9, "phone": "+1-415-555-0102", "city": "San Francisco",
         "state": "California", "country": "United States", "company_idx": 0},

        # Notion
        {"first_name": "Ivan", "last_name": "Zhao", "title": "CEO & Co-Founder", "seniority": "c_suite",
         "department": "executive", "email": "ivan@notion.so", "email_status": "verified",
         "email_confidence": 0.9, "city": "San Francisco", "state": "California",
         "country": "United States", "company_idx": 1},
        {"first_name": "Akshay", "last_name": "Kothari", "title": "COO", "seniority": "c_suite",
         "department": "operations", "email": "akshay@notion.so", "email_status": "verified",
         "email_confidence": 0.85, "phone": "+1-415-555-0201", "city": "San Francisco",
         "state": "California", "country": "United States", "company_idx": 1},

        # Figma
        {"first_name": "Dylan", "last_name": "Field", "title": "CEO & Co-Founder", "seniority": "c_suite",
         "department": "executive", "email": "dylan@figma.com", "email_status": "verified",
         "email_confidence": 0.9, "city": "San Francisco", "state": "California",
         "country": "United States", "company_idx": 2},
        {"first_name": "Kris", "last_name": "Rasmussen", "title": "VP of Engineering", "seniority": "vp",
         "department": "engineering", "email": "kris@figma.com", "email_status": "unverified",
         "email_confidence": 0.6, "city": "San Francisco", "state": "California",
         "country": "United States", "company_idx": 2},

        # Vercel
        {"first_name": "Guillermo", "last_name": "Rauch", "title": "CEO & Founder", "seniority": "c_suite",
         "department": "executive", "email": "guillermo@vercel.com", "email_status": "verified",
         "email_confidence": 0.95, "phone": "+1-415-555-0401", "city": "San Francisco",
         "state": "California", "country": "United States",
         "linkedin_url": "https://linkedin.com/in/guillermo-rauch", "company_idx": 3},

        # Linear
        {"first_name": "Karri", "last_name": "Saarinen", "title": "CEO & Co-Founder", "seniority": "c_suite",
         "department": "executive", "email": "karri@linear.app", "email_status": "verified",
         "email_confidence": 0.9, "city": "San Francisco", "state": "California",
         "country": "United States", "company_idx": 4},
        {"first_name": "Tuomas", "last_name": "Artman", "title": "CTO & Co-Founder", "seniority": "c_suite",
         "department": "engineering", "email": "tuomas@linear.app", "email_status": "verified",
         "email_confidence": 0.9, "city": "San Francisco", "state": "California",
         "country": "United States", "company_idx": 4},

        # Datadog
        {"first_name": "Olivier", "last_name": "Pomel", "title": "CEO & Co-Founder", "seniority": "c_suite",
         "department": "executive", "email": "olivier.pomel@datadoghq.com", "email_status": "verified",
         "email_confidence": 0.9, "phone": "+1-212-555-0601", "city": "New York",
         "state": "New York", "country": "United States", "company_idx": 5},
        {"first_name": "Alexis", "last_name": "Le-Quoc", "title": "CTO & Co-Founder", "seniority": "c_suite",
         "department": "engineering", "email": "alexis@datadoghq.com", "email_status": "unverified",
         "email_confidence": 0.7, "city": "New York", "state": "New York",
         "country": "United States", "company_idx": 5},
        {"first_name": "Maria", "last_name": "Teresa Lopez", "title": "Director of Sales", "seniority": "director",
         "department": "sales", "email": "maria.lopez@datadoghq.com", "email_status": "verified",
         "email_confidence": 0.85, "phone": "+1-212-555-0602", "city": "New York",
         "state": "New York", "country": "United States", "company_idx": 5},

        # Plaid
        {"first_name": "Zach", "last_name": "Perret", "title": "CEO & Co-Founder", "seniority": "c_suite",
         "department": "executive", "email": "zach@plaid.com", "email_status": "verified",
         "email_confidence": 0.9, "city": "San Francisco", "state": "California",
         "country": "United States", "company_idx": 6},

        # Revolut
        {"first_name": "Nikolay", "last_name": "Storonsky", "title": "CEO & Founder", "seniority": "c_suite",
         "department": "executive", "email": "nikolay@revolut.com", "email_status": "unverified",
         "email_confidence": 0.7, "city": "London", "state": "England",
         "country": "United Kingdom", "company_idx": 7},
        {"first_name": "Hiroki", "last_name": "Takeuchi", "title": "VP Engineering APAC", "seniority": "vp",
         "department": "engineering", "email": "hiroki.takeuchi@revolut.com", "email_status": "unverified",
         "email_confidence": 0.6, "phone": "+44-20-7946-0801", "city": "London",
         "state": "England", "country": "United Kingdom", "company_idx": 7},

        # Canva
        {"first_name": "Melanie", "last_name": "Perkins", "title": "CEO & Co-Founder", "seniority": "c_suite",
         "department": "executive", "email": "melanie@canva.com", "email_status": "verified",
         "email_confidence": 0.9, "city": "Sydney", "state": "NSW",
         "country": "Australia", "company_idx": 8},
        {"first_name": "Cliff", "last_name": "Obrecht", "title": "COO & Co-Founder", "seniority": "c_suite",
         "department": "operations", "email": "cliff@canva.com", "email_status": "verified",
         "email_confidence": 0.85, "city": "Sydney", "state": "NSW",
         "country": "Australia", "company_idx": 8},

        # Miro
        {"first_name": "Andrey", "last_name": "Khusid", "title": "CEO & Founder", "seniority": "c_suite",
         "department": "executive", "email": "andrey@miro.com", "email_status": "verified",
         "email_confidence": 0.9, "city": "San Francisco", "state": "California",
         "country": "United States", "company_idx": 9},
        {"first_name": "Varun", "last_name": "Parmar", "title": "Chief Product Officer", "seniority": "c_suite",
         "department": "product", "email": "varun@miro.com", "email_status": "unverified",
         "email_confidence": 0.65, "city": "San Francisco", "state": "California",
         "country": "United States", "company_idx": 9},

        # Bechtel (Construction)
        {"first_name": "Brendan", "last_name": "Bechtel", "title": "Chairman & CEO", "seniority": "c_suite",
         "department": "executive", "email": "brendan.bechtel@bechtel.com", "email_status": "verified",
         "email_confidence": 0.85, "phone": "+1-415-555-1001", "city": "San Francisco",
         "state": "California", "country": "United States", "company_idx": 10},
        {"first_name": "Craig", "last_name": "Albert", "title": "President & COO", "seniority": "c_suite",
         "department": "operations", "email": "craig.albert@bechtel.com", "email_status": "verified",
         "email_confidence": 0.8, "city": "San Francisco", "state": "California",
         "country": "United States", "company_idx": 10},

        # Turner Construction
        {"first_name": "Peter", "last_name": "Davoren", "title": "President & CEO", "seniority": "c_suite",
         "department": "executive", "email": "peter.davoren@tcco.com", "email_status": "verified",
         "email_confidence": 0.8, "phone": "+1-212-555-1101", "city": "New York",
         "state": "New York", "country": "United States", "company_idx": 11},

        # Skanska
        {"first_name": "Richard", "last_name": "Cavallaro", "title": "EVP & COO", "seniority": "c_suite",
         "department": "operations", "email": "richard.cavallaro@skanska.com", "email_status": "unverified",
         "email_confidence": 0.7, "phone": "+1-212-555-1201", "city": "New York",
         "state": "New York", "country": "United States", "company_idx": 12},

        # Hensel Phelps
        {"first_name": "Michael", "last_name": "Choutka", "title": "President & CEO", "seniority": "c_suite",
         "department": "executive", "email": "mchoutka@henselphelps.com", "email_status": "verified",
         "email_confidence": 0.85, "city": "Denver", "state": "Colorado",
         "country": "United States", "company_idx": 13},

        # Epic Systems
        {"first_name": "Judy", "last_name": "Faulkner", "title": "Founder & CEO", "seniority": "c_suite",
         "department": "executive", "email": "judy@epic.com", "email_status": "verified",
         "email_confidence": 0.9, "city": "Chicago", "state": "Illinois",
         "country": "United States", "company_idx": 14},

        # Shopify
        {"first_name": "Tobias", "last_name": "Lutke", "title": "CEO & Founder", "seniority": "c_suite",
         "department": "executive", "email": "tobi@shopify.com", "email_status": "verified",
         "email_confidence": 0.9, "phone": "+1-416-555-1401", "city": "Toronto",
         "state": "Ontario", "country": "Canada",
         "linkedin_url": "https://linkedin.com/in/tobiaslutke", "company_idx": 15},

        # HubSpot
        {"first_name": "Yamini", "last_name": "Rangan", "title": "CEO", "seniority": "c_suite",
         "department": "executive", "email": "yrangan@hubspot.com", "email_status": "verified",
         "email_confidence": 0.85, "phone": "+1-617-555-1501", "city": "Boston",
         "state": "Massachusetts", "country": "United States",
         "linkedin_url": "https://linkedin.com/in/yaminirangan", "company_idx": 16},
        {"first_name": "Dharmesh", "last_name": "Shah", "title": "CTO & Co-Founder", "seniority": "c_suite",
         "department": "engineering", "email": "dshah@hubspot.com", "email_status": "verified",
         "email_confidence": 0.9, "city": "Boston", "state": "Massachusetts",
         "country": "United States", "company_idx": 16},
    ]

    contact_objs = []
    for c_data in contacts_data:
        idx = c_data.pop("company_idx")
        co = company_objs[idx]
        contact = Contact(
            **c_data,
            full_name=f"{c_data['first_name']} {c_data['last_name']}",
            company_id=co.id,
            company_name=co.name,
            source="seed",
        )
        db.add(contact)
        db.flush()
        contact_objs.append(contact)

    # Create demo lists
    tech_ceos = ContactList(name="Tech CEOs", description="C-suite at top tech companies",
                            color="#6366f1", owner_id=user.id)
    db.add(tech_ceos)
    db.flush()

    for c in contact_objs:
        if c.seniority == "c_suite":
            db.add(ListMember(list_id=tech_ceos.id, contact_id=c.id))

    fintech_leads = ContactList(name="FinTech Leads", description="Contacts at fintech companies",
                                color="#f59e0b", owner_id=user.id)
    db.add(fintech_leads)
    db.flush()

    for c in contact_objs:
        if c.company_name in ["Stripe", "Plaid", "Revolut"]:
            db.add(ListMember(list_id=fintech_leads.id, contact_id=c.id))

    # Create demo sequence
    outreach_seq = Sequence(
        name="Cold Outreach — SaaS Decision Makers",
        description="3-step email sequence for SaaS executives",
        owner_id=user.id,
        status="draft",
    )
    db.add(outreach_seq)
    db.flush()

    steps = [
        SequenceStep(
            sequence_id=outreach_seq.id, order=0, step_type="email",
            delay_days=0, subject="Quick question about {{company_name}}",
            body="Hi {{first_name}},\n\nI noticed {{company_name}} is scaling fast — congrats on the growth.\n\nWe help companies like yours [value prop]. Would love 15 min to show you how.\n\nBest,\n{{sender_name}}",
        ),
        SequenceStep(
            sequence_id=outreach_seq.id, order=1, step_type="wait",
            delay_days=3,
        ),
        SequenceStep(
            sequence_id=outreach_seq.id, order=2, step_type="email",
            delay_days=0, subject="Re: Quick question about {{company_name}}",
            body="Hi {{first_name}},\n\nJust circling back — I know you're busy. Here's a 2-min case study that might resonate: [link]\n\nWorth a quick chat?\n\n{{sender_name}}",
        ),
        SequenceStep(
            sequence_id=outreach_seq.id, order=3, step_type="wait",
            delay_days=5,
        ),
        SequenceStep(
            sequence_id=outreach_seq.id, order=4, step_type="email",
            delay_days=0, subject="Last note — {{first_name}}",
            body="Hi {{first_name}},\n\nDon't want to be a pest. If the timing isn't right, totally understand.\n\nIf it ever is, I'm here: [calendar_link]\n\nCheers,\n{{sender_name}}",
        ),
    ]
    for step in steps:
        db.add(step)

    db.commit()
    db.close()
    print(f"Seeded: {len(company_objs)} companies, {len(contact_objs)} contacts, 2 lists, 1 sequence")
    print("Demo login: demo@pheobus.io / demo1234")


if __name__ == "__main__":
    seed()
