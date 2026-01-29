import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Create a regular Supabase client to verify the requesting user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the user from the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Verify the user is an admin
    console.log('Checking user role for user ID:', user.id)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    console.log('Profile query result:', { profile, profileError })
    
    if (profileError) {
      console.error('Profile error:', profileError)
      throw new Error(`Profile not found: ${profileError.message}`)
    }
    
    if (profile?.role !== 'admin') {
      console.log('User role is not admin, role:', profile?.role)
      throw new Error('Unauthorized: Admin access required')
    }

    // Get the request body
    const { accountantId } = await req.json()

    if (!accountantId) {
      throw new Error('Missing required field: accountantId')
    }

    // Verify the accountant belongs to this admin
    const { data: accountantProfile, error: accountantError } = await supabaseAdmin
      .from('profiles')
      .select('created_by_admin, role')
      .eq('user_id', accountantId)
      .maybeSingle()

    if (accountantError) {
      throw new Error('Accountant not found')
    }

    if (!accountantProfile) {
      throw new Error('Accountant profile not found')
    }

    if (accountantProfile.created_by_admin !== user.id || accountantProfile.role !== 'accountant') {
      throw new Error('Unauthorized: You can only delete accountants you created')
    }

    // Delete the user from Supabase Auth (this will cascade delete the profile due to the trigger)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(accountantId)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      throw deleteError
    }

    console.log(`Successfully deleted accountant with ID: ${accountantId}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Accountant deleted successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error deleting accountant:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})