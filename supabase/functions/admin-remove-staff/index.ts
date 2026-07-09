import { requireRole, jsonResponse, corsHeaders } from '../_shared/auth-helper.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const result = await requireRole(req, ['admin']);
  if (result.error) return jsonResponse({ error: result.error }, result.status);
  const { admin, user } = result;

  const { user_id } = await req.json();

  if (user_id === user.id) {
    return jsonResponse({ error: "You can't remove your own account." }, 400);
  }

  const { error } = await admin.auth.admin.deleteUser(user_id);
  if (error) return jsonResponse({ error: error.message }, 500);
  // The profiles row cascades away automatically via the FK on delete.

  return jsonResponse({ success: true });
});
