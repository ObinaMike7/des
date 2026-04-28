import { supabase } from './supabase'

export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  // Get user role from custom metadata or a user table
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  return {
    token: data.session.access_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      role: userData?.role || 'user',
    },
  }
}

export const signUp = async ({ email, password, username, role = 'user' }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  // Create user record in users table
  if (data.user) {
    await supabase.from('users').insert([
      {
        id: data.user.id,
        email,
        username,
        role,
      },
    ])
  }

  return {
    token: data.session?.access_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      role,
    },
  }
}

