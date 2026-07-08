import { requireRole, jsonResponse, corsHeaders } from '../_shared/auth-helper.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const result = await requireRole(req, ['admin']);
  if (result.error) return jsonResponse({ error: result.error }, result.status);
  const { admin, user } = result;

  const { user_id, role } = await req.json();

  if (!['admin', 'editor'].includes(role)) {
    return jsonResponse({ error: 'Role must be admin or editor.' }, 400);
  }
  if (user_id === user.id && role !== 'admin') {
    return jsonResponse({ error: "You can't remove your own admin access." }, 400);
  }

  const { error } = await admin.from('profiles').update({ role }).eq('id', user_id);
  if (error) return jsonResponse({ error: error.message }, 500);

  return jsonResponse({ success: true });
});
