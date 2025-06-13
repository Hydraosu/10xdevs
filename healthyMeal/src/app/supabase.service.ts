import { Injectable } from '@angular/core'
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js'
import { environment } from '../environments/environment'

export interface Profile {
  id?: string
  username: string
  website: string
  avatar_url: string
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  supabase: SupabaseClient
  _session: AuthSession | null = null

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
    
    // Initialize session from storage
    this.initializeSession()
    
    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this._session = session
      if (session) {
        localStorage.setItem('access_token', session.access_token)
        localStorage.setItem('refresh_token', session.refresh_token)
      } else {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    })
  }

  private async initializeSession() {
    // Try to get session from storage
    const accessToken = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')

    if (accessToken && refreshToken) {
      try {
        const { data: { session }, error } = await this.supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })
        
        if (error) {
          console.error('Error restoring session:', error)
          this.clearSession()
        } else {
          this._session = session
        }
      } catch (error) {
        console.error('Error initializing session:', error)
        this.clearSession()
      }
    }
  }

  private clearSession() {
    this._session = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  get session() {
    return this._session
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }
}