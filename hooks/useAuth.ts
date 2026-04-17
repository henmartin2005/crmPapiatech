"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        
        setProfile(profile)
      } else {
        setProfile(null)
      }
      setLoading(false)
    }

    fetchUserAndProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
        setProfile(profile)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
      
      if (event === 'SIGNED_OUT') {
        router.push('/login')
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const isSuperAdmin = profile?.role === "super_admin"
  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin"

  return {
    user,
    profile,
    loading,
    logout,
    isSuperAdmin,
    isAdmin,
  }
}
