// Place this file at: supabase/functions/admin-search-customer/index.ts
import { requireRole, jsonResponse, corsHeaders } from '../_shared/auth-helper.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Read-only lookup — admin and editor both allowed.
    const result = await requireRole(req, ['admin', 'editor']);
    if (result.error) return jsonResponse({ error: result.error }, result.status);
    const { admin } = result;

    const { query } = await req.json();
    if (!query) {
      return jsonResponse({ error: 'Enter a phone number or Customer ID.' }, 400);
    }

    const { data, error } = await admin.rpc('search_customer', { p_query: query.trim() });

    if (error || !data || data.length === 0) {
      return jsonResponse({ error: 'No customer found with that phone number or Customer ID.' }, 404);
    }

    return jsonResponse({ customer: data[0] });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});
