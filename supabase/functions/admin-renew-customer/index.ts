// Place this file at: supabase/functions/admin-renew-customer/index.ts
import { requireRole, jsonResponse, corsHeaders } from '../_shared/auth-helper.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Admin and editor both allowed — editors can add/find/search/import/export.
    const result = await requireRole(req, ['admin', 'editor']);
    if (result.error) return jsonResponse({ error: result.error }, result.status);
    const { admin } = result;

    const { customer_id, new_expiry } = await req.json();
    if (!customer_id || !new_expiry) {
      return jsonResponse({ error: 'Customer ID and a new expiry date are required.' }, 400);
    }

    const { error } = await admin.rpc('renew_customer', {
      p_customer_id: customer_id,
      p_new_expiry: new_expiry,
    });

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});
