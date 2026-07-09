import { requireRole, jsonResponse } from '../_shared/auth-helper.ts';

Deno.serve(async (req) => {
  const result = await requireRole(req, ['admin']);
  if (result.error) return jsonResponse({ error: result.error }, result.status);
  const { admin } = result;

  try {
    const { data: profiles, error: fetchError } = await admin
      .from('profiles')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    return jsonResponse({ success: true, profiles });
  } catch (error) {
    return jsonResponse({ 
      error: 'Failed to list staff',
      details: error.message 
    }, 500);
  }
});