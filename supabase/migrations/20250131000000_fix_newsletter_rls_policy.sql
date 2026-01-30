-- Fix newsletter_subscribers RLS policies
-- Remove overly permissive policies that trigger Supabase security warnings
-- All operations now happen via service_role (admin client) which bypasses RLS

-- Drop the permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;

-- Drop the permissive UPDATE policy
DROP POLICY IF EXISTS "Anyone can unsubscribe via token" ON public.newsletter_subscribers;

-- Revoke INSERT and UPDATE from anon and authenticated
-- Only service_role (used by admin client in server actions) can insert/update
REVOKE INSERT, UPDATE ON public.newsletter_subscribers FROM anon;
REVOKE INSERT, UPDATE ON public.newsletter_subscribers FROM authenticated;
