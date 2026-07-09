import { requireRole, jsonResponse, corsHeaders } from '../_shared/auth-helper.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const result = await requireRole(req, ['admin']);
  if (result.error) return jsonResponse({ error: result.error }, result.status);
  const { admin } = result;

  const { email, password, role } = await req.json();

  if (!email || !password || password.length < 8) {
    return jsonResponse({ error: 'Email and an 8+ character password are required.' }, 400);
  }
  if (!['admin', 'editor'].includes(role)) {
    return jsonResponse({ error: 'Role must be admin or editor.' }, 400);
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr || !created?.user) {
    return jsonResponse({ error: createErr?.message || 'Could not create user.' }, 400);
  }

  const { error: profileErr } = await admin
    .from('profiles')
    .insert({ id: created.user.id, email, role });

  if (profileErr) {
    // Roll back the auth user so we never leave a login with no role attached.
    await admin.auth.admin.deleteUser(created.user.id);
    return jsonResponse({ error: profileErr.message }, 500);
  }

  return jsonResponse({ success: true, user_id: created.user.id });
});
