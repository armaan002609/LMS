-- =========================================================
-- DarkSpaceSecurity LMS - Supabase PostgreSQL Schema & Seed
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- =========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL DEFAULT 'password',
    role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('admin', 'learner', 'instructor')),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    summary TEXT,
    category TEXT DEFAULT 'Offensive Security',
    level TEXT DEFAULT 'Intermediate',
    total_hours INT DEFAULT 40,
    modules_count INT DEFAULT 12,
    target_lab_ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Enrollments / Course Assignments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'REVOKED')),
    progress_pct NUMERIC(5,2) DEFAULT 0.00,
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, course_id)
);

-- 6. Enable Row-Level Security (RLS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies (Allow access for authenticated service / anon for app operations)
DROP POLICY IF EXISTS "Public read access for darkspace courses" ON public.courses;
CREATE POLICY "Public read access for darkspace courses" ON public.courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow user operations" ON public.users;
CREATE POLICY "Allow user operations" ON public.users FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow enrollment operations" ON public.enrollments;
CREATE POLICY "Allow enrollment operations" ON public.enrollments FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow organization operations" ON public.organizations;
CREATE POLICY "Allow organization operations" ON public.organizations FOR ALL USING (true);

-- =========================================================
-- SEED DATA
-- =========================================================

-- Insert Organization
INSERT INTO public.organizations (id, slug, name)
VALUES ('a0000000-0000-0000-0000-000000000001', 'darkspace', 'Dark Space Security')
ON CONFLICT (slug) DO NOTHING;

-- Insert Admin User & Learner User
INSERT INTO public.users (id, email, name, role, organization_id)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'admin@darkspacesecurity.io', 'Security Commander (Admin)', 'admin', 'a0000000-0000-0000-0000-000000000001'),
    ('b0000000-0000-0000-0000-000000000002', 'learner@darkspacesecurity.io', 'Alex Mercer (Red Team Cadet)', 'learner', 'a0000000-0000-0000-0000-000000000001'),
    ('b0000000-0000-0000-0000-000000000003', 'sarah.connor@darkspacesecurity.io', 'Sarah Connor (Penetration Tester)', 'learner', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (email) DO NOTHING;

-- Insert Cybersecurity Courses
INSERT INTO public.courses (id, organization_id, title, slug, summary, category, level, total_hours, modules_count, target_lab_ip)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Offensive Security Certified Specialist', 'offensive-security-specialist', 'Active Directory exploitation, AV evasion, and command and control ops.', 'Offensive Security', 'Advanced', 80, 16, '10.10.11.45'),
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Web Application & API Penetration Testing', 'web-api-vapt', 'OWASP Top 10, GraphQL injection, OAuth exploitation, and zero-day hunting.', 'Web Security', 'Intermediate', 60, 14, '10.10.14.82'),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Cloud Security & AWS DevSecOps Architecture', 'cloud-security-aws', 'Hardening cloud environments, IAM privilege escalation, and container escape.', 'Cloud Security', 'Advanced', 50, 10, '10.10.18.99'),
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'SOC Analyst & Threat Hunting Blueprint', 'soc-analyst-threat-hunting', 'SIEM log analysis, memory forensics, network traffic packet inspection.', 'Defensive Security', 'Intermediate', 45, 12, '10.10.22.10'),
    ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'Zero-Day Exploitation & Reverse Engineering', 'zero-day-reverse-engineering', 'x86/x64 assembly, buffer overflows, Ghidra disassembly, and kernel debugging.', 'Exploit Dev', 'Advanced', 90, 18, '10.10.30.50'),
    ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', 'AI Security & LLM Prompt Injection Defense', 'ai-security-llm-defense', 'Securing generative AI pipelines against prompt injection, jailbreaking, and data poisoning.', 'AI Security', 'Beginner', 35, 8, '10.10.40.12')
ON CONFLICT DO NOTHING;

-- Initial Course Assignments for Alex Mercer (learner)
INSERT INTO public.enrollments (organization_id, user_id, course_id, status, progress_pct)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'ACTIVE', 64.00),
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'ACTIVE', 28.50)
ON CONFLICT (user_id, course_id) DO NOTHING;
