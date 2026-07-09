import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Service-role client — deliberately has NO Authorization header override.
// (This is the exact bug already fixed once elsewhere in this project:
// overriding the service client's header with the caller's JWT silently
// defeats the RLS bypass.)
export function serviceClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
}

type RequireRoleResult =
  | { error: string; status: number; admin?: undefined; user?: undefined; profile?: undefined }
  | { error?: undefined; status?: undefined; admin: ReturnType<typeof createClient>; user: { id: string; email?: string }; profile: { role: string } };

// Verifies the caller's JWT identity (via a client scoped to that JWT),
// then looks up their role in `profiles` using the service-role client,
// and only returns the service client if their role is in allowedRoles.
export async function requireRole(req: Request, allowedRoles: string[]): Promise<RequireRoleResult> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return { error: 'Missing authorization', status: 401 };

  const caller = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userErr } = await caller.auth.getUser();
  if (userErr || !user) return { error: 'Invalid session', status: 401 };

  const admin = serviceClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !allowedRoles.includes(profile.role)) {
    return { error: 'Not authorized for this action', status: 403 };
  }

  return { admin, user, profile };
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
