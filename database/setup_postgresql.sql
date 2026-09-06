-- ============================================================================
-- AlphaERP - HVAC Enterprise Master Unified Database Setup Script
-- Executes complete DDL Schema followed by Seed Data
-- ============================================================================

\echo '---------------------------------------------------------'
\echo 'AlphaERP: Initializing Database Schema...'
\echo '---------------------------------------------------------'

\i database/schema.sql

\echo '---------------------------------------------------------'
\echo 'AlphaERP: Populating Seed and Master Records...'
\echo '---------------------------------------------------------'

\i database/seed_data.sql

\echo '---------------------------------------------------------'
\echo 'AlphaERP: Database Initialization Complete!'
\echo '---------------------------------------------------------'
