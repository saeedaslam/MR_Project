/**
 * Configuration Management System
 * 
 * This file handles environment configuration for the application.
 * In production, use environment variables or a server-side config.
 * 
 * SECURITY NOTE: For client-side apps, the Supabase anon key is safe to expose
 * as it's restricted by Row Level Security (RLS) policies in your database.
 * However, never expose the SUPABASE_SERVICE_ROLE_KEY.
 */

const AppConfig = {
  // Supabase Configuration
  supabase: {
    url: 'https://iuzwdjgagcxqwtpihpmb.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1endkamdhZ2N4cXd0cGlocG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MzQ0NzMsImV4cCI6MjA5ODExMDQ3M30.h_ofLT6hKZUsiw3lfZh2qAO62C1BT78k4dSjGXrzAow'
  },
  
  // UI Configuration
  slider: {
    interval: 3500,
    scrollAmount: 160
  },
  
  // Feature Flags
  features: {
    enableNotifications: true,
    enableAutoRefresh: false,
    refreshInterval: 30000
  }
};

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppConfig;
}
