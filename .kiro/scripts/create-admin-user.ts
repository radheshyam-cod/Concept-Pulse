#!/usr/bin/env node

/**
 * Admin User Creation Script
 * Creates the admin user for ConceptPulse application
 * Ensures proper authentication setup
 */

import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'admin@conceptpule.ed';
const ADMIN_PASSWORD = 'admin@123';
const ADMIN_NAME = 'ConceptPulse Administrator';

interface AdminUserConfig {
  email: string;
  password: string;
  name: string;
  class: string;
  exam_type: string;
  role: 'admin';
}

async function createAdminUser(): Promise<void> {
  console.log('🔧 Creating ConceptPulse admin user...');
  console.log('=====================================');

  try {
    // Get Supabase configuration
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://onswemqebfrvtoqozuae.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uc3dlbXFlYmZydnRvcW96dWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMDQ3NDIsImV4cCI6MjA4MjU4MDc0Mn0.uJydGy5rVgAZL5fStSVWcYA6Gb9cmbvgeC11AU1RgNc';
    const apiBaseUrl = process.env.VITE_API_BASE_URL || 'https://onswemqebfrvtoqozuae.supabase.co/functions/v1/make-server-812a95c3';

    console.log('📋 Configuration:');
    console.log(`  Supabase URL: ${supabaseUrl}`);
    console.log(`  API Base URL: ${apiBaseUrl}`);
    console.log(`  Admin Email: ${ADMIN_EMAIL}`);

    // Test API connectivity first
    console.log('\n🔍 Testing API connectivity...');
    const healthResponse = await fetch(`${apiBaseUrl}/health`);
    
    if (!healthResponse.ok) {
      throw new Error(`API health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
    }

    const healthData = await healthResponse.json();
    console.log('✅ API is healthy:', healthData);

    // Create admin user via API
    console.log('\n👤 Creating admin user...');
    const signupResponse = await fetch(`${apiBaseUrl}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME
      })
    });

    if (!signupResponse.ok) {
      const errorData = await signupResponse.json();
      
      // If user already exists, that's okay
      if (errorData.error && errorData.error.includes('already registered')) {
        console.log('⚠️ Admin user already exists, attempting to sign in...');
        
        // Try to sign in instead
        const signinResponse = await fetch(`${apiBaseUrl}/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
          })
        });

        if (!signinResponse.ok) {
          const signinError = await signinResponse.json();
          throw new Error(`Admin user signin failed: ${signinError.error}`);
        }

        const signinData = await signinResponse.json();
        console.log('✅ Admin user signed in successfully');
        
        // Update profile to ensure admin settings
        if (signinData.session?.access_token) {
          await updateAdminProfile(apiBaseUrl, signinData.session.access_token);
        }
        
        return;
      } else {
        throw new Error(`Admin user creation failed: ${errorData.error}`);
      }
    }

    const signupData = await signupResponse.json();
    console.log('✅ Admin user created successfully');

    // Sign in to get access token
    console.log('\n🔐 Signing in admin user...');
    const signinResponse = await fetch(`${apiBaseUrl}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    if (!signinResponse.ok) {
      const errorData = await signinResponse.json();
      throw new Error(`Admin signin failed: ${errorData.error}`);
    }

    const signinData = await signinResponse.json();
    console.log('✅ Admin user signed in successfully');

    // Update profile with admin settings
    if (signinData.session?.access_token) {
      await updateAdminProfile(apiBaseUrl, signinData.session.access_token);
    }

    console.log('\n🎉 Admin user setup completed successfully!');
    console.log('=====================================');
    console.log('Admin Credentials:');
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log('\nYou can now log in to the application with these credentials.');

  } catch (error) {
    console.error('❌ Admin user creation failed:', error);
    console.error('=====================================');
    process.exit(1);
  }
}

async function updateAdminProfile(apiBaseUrl: string, accessToken: string): Promise<void> {
  console.log('\n📝 Updating admin profile...');
  
  try {
    const profileResponse = await fetch(`${apiBaseUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        name: ADMIN_NAME,
        class: 'Administrator',
        exam_type: 'Admin'
      })
    });

    if (!profileResponse.ok) {
      const errorData = await profileResponse.json();
      throw new Error(`Profile update failed: ${errorData.error}`);
    }

    const profileData = await profileResponse.json();
    console.log('✅ Admin profile updated successfully');
    console.log('   Profile:', profileData.user);

  } catch (error) {
    console.warn('⚠️ Profile update failed (user can update manually):', error);
  }
}

// Run if called directly
if (require.main === module) {
  createAdminUser().catch(console.error);
}

export { createAdminUser };