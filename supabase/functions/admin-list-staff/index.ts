import { requireRole, jsonResponse, corsHeaders } from '../_shared/auth-helper.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const result = await requireRole(req, ['admin']);
  if (result.error) return jsonResponse({ error: result.error }, result.status);
  const { admin } = result;

  const { data, error } = await admin
    .from('profiles')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: true });

  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ staff: data });
});
