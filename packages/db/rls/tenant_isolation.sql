-- ============================================================================
-- Row-Level Security (RLS) Tenant Isolation Policies
-- Rule: Every tenant-scoped table has organization_id and an RLS policy.
-- TRD §2 & BRAIN.md §5
-- ============================================================================

-- Function to get current tenant organization ID from PostgreSQL session
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS uuid AS $$
BEGIN
  RETURN NULLIF(current_setting('app.organization_id', true), '')::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

-- Macro to enable RLS and create isolation policy for a tenant table
DO $$
DECLARE
  t text;
  tenant_tables text[] := ARRAY[
    'courses',
    'course_versions',
    'sections',
    'lessons',
    'content_blocks',
    'learning_paths',
    'learning_path_courses',
    'enrollments',
    'lesson_progress',
    'scorm_packages',
    'scorm_attempts',
    'xapi_statements',
    'question_banks',
    'questions',
    'assessments',
    'assessment_attempts',
    'attempt_answers',
    'assignments',
    'submissions',
    'certificate_templates',
    'certificates',
    'forum_threads',
    'forum_posts',
    'conversations',
    'messages',
    'live_sessions',
    'notifications',
    'points_ledger',
    'badges',
    'user_badges',
    'recommendations',
    'products',
    'prices',
    'orders',
    'payments',
    'coupons',
    'subscriptions',
    'integrations',
    'webhook_endpoints',
    'webhook_deliveries',
    'api_keys',
    'analytics_events',
    'groups',
    'group_members'
  ];
BEGIN
  FOREACH t IN ARRAY tenant_tables LOOP
    -- Enable Row Level Security
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    
    -- Drop existing policy if present
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I;', t);
    
    -- Create policy ensuring access only to the matching organization_id
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I ' ||
      'AS RESTRICTIVE ' ||
      'USING (organization_id = current_tenant_id()) ' ||
      'WITH CHECK (organization_id = current_tenant_id());',
      t
    );
  END LOOP;
END $$;
