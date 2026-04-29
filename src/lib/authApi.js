import { supabase } from './supabase'

export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  // Get user role from user metadata
  const role = data.user.user_metadata?.role || 'user'

  return {
    token: data.session.access_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      username: data.user.user_metadata?.username || email.split('@')[0],
      role: role,
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
        role,
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return {
    token: data.session?.access_token,
    user: {
      id: data.user?.id,
      email: data.user?.email,
      username,
      role,
    },
  }
}

