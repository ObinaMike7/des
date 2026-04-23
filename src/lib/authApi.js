import { API_BASE_URL } from './apiBaseUrl'
import { requestJson } from './request'

const AUTH_API_URL = `${API_BASE_URL}/api/auth`

export const signIn = async (payload) =>
  requestJson(
    `${AUTH_API_URL}/signin`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
    'Sign in failed'
  )

export const signUp = async (payload) =>
  requestJson(
    `${AUTH_API_URL}/signup`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
    'Signup failed'
  )

