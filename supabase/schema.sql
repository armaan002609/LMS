-- =========================================================
-- DarkSpaceSecurity LMS - Supabase PostgreSQL Schema
-- Clean Production Configuration (Zero Demo Data)
-- =========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL DEFAULT 'password',
    role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('admin', 'learner', 'instructor')),
    assigned_instructor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 7. RLS Policies
DROP POLICY IF EXISTS "Allow course operations" ON public.courses;
CREATE POLICY "Allow course operations" ON public.courses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow user operations" ON public.users;
CREATE POLICY "Allow user operations" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow enrollment operations" ON public.enrollments;
CREATE POLICY "Allow enrollment operations" ON public.enrollments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow organization operations" ON public.organizations;
CREATE POLICY "Allow organization operations" ON public.organizations FOR ALL USING (true) WITH CHECK (true);

-- =========================================================
-- INITIAL ADMIN INITIALIZATION (No Demo Learners / Enrollments)
-- =========================================================

-- Insert Primary Organization
INSERT INTO public.organizations (id, slug, name)
VALUES ('a0000000-0000-0000-0000-000000000001', 'darkspace', 'Dark Space Security')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Insert Admin and Instructor Accounts
INSERT INTO public.users (id, email, name, role, organization_id)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'admin@darkspacesecurity.io', 'Admin', 'admin', 'a0000000-0000-0000-0000-000000000001'),
    ('b0000000-0000-0000-0000-000000000002', 'instructor@darkspacesecurity.io', 'Lead Faculty Instructor', 'instructor', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;
