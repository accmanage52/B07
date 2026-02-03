import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// ✅ CORS headers (IMPORTANT)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // replace with your domain in prod
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    // ✅ Read Authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: corsHeaders }
      )
    }

    const token = authHeader.replace("Bearer ", "")

    // ✅ Client for verifying the logged-in user
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    )

    // ✅ Admin client (service role)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // ✅ Verify JWT
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: corsHeaders }
      )
    }

    // ✅ Check admin role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: corsHeaders }
      )
    }

    // ✅ Parse request body
    const { email, password, fullName } = await req.json()

    if (!email || !password || !fullName) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: email, password, fullName",
        }),
        { status: 400, headers: corsHeaders }
      )
    }

    // ✅ Create accountant user
    const { data, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: "accountant",
          created_by_admin: user.id,
        },
      })

    if (createError) {
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: corsHeaders }
      )
    }

    // ✅ Success response
    return new Response(
      JSON.stringify({
        success: true,
        user: data.user,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    )
  } catch (error) {
    console.error("Function error:", error)

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    )
  }
})
