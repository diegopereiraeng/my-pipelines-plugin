import { useState } from 'react'
import type { HarnessUser } from './useUserSearch'

const CACHE_KEY = 'my-pipelines-user-email'
const CACHE_UUID_KEY = 'my-pipelines-user-uuid'
const CACHE_NAME_KEY = 'my-pipelines-user-name'

function readCache() {
  try {
    return {
      email: localStorage.getItem(CACHE_KEY),
      userId: localStorage.getItem(CACHE_UUID_KEY),
      name: localStorage.getItem(CACHE_NAME_KEY),
    }
  } catch {
    return { email: null, userId: null, name: null }
  }
}

function writeCache(user: HarnessUser) {
  try {
    localStorage.setItem(CACHE_KEY, user.email.toLowerCase())
    localStorage.setItem(CACHE_UUID_KEY, user.uuid)
    localStorage.setItem(CACHE_NAME_KEY, user.name)
  } catch { /* ignore */ }
}

function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_UUID_KEY)
    localStorage.removeItem(CACHE_NAME_KEY)
  } catch { /* ignore */ }
}

export function useCurrentUser() {
  const cached = readCache()
  const [email, setEmail] = useState<string | null>(cached.email)
  const [userId, setUserId] = useState<string | null>(cached.userId)
  const [name, setName] = useState<string | null>(cached.name)

  const isIdentified = !!email

  function saveUser(user: HarnessUser) {
    setEmail(user.email.toLowerCase())
    setUserId(user.uuid)
    setName(user.name)
    writeCache(user)
  }

  function clearUser() {
    setEmail(null)
    setUserId(null)
    setName(null)
    clearCache()
  }

  return { email, userId, name, isIdentified, saveUser, clearUser }
}
