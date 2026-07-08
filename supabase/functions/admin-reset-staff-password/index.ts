import { requireRole, jsonResponse, corsHeaders } from '../_shared/auth-helper.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const result = await requireRole(req, ['admin']);
  if (result.error) return jsonResponse({ error: result.error }, result.status);
  const { admin } = result;

  const { user_id, new_password } = await req.json();

  if (!new_password || new_password.length < 8) {
    return jsonResponse({ error: 'Password must be at least 8 characters.' }, 400);
  }

  const { error } = await admin.auth.admin.updateUserById(user_id, { password: new_password });
  if (error) return jsonResponse({ error: error.message }, 500);

  return jsonResponse({ success: true });
});
