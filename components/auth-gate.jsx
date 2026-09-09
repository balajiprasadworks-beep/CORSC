"use client"

import { useEffect, useState } from "react"
import { ShieldCheck } from "lucide-react"

import { CinematicLogin } from "@/components/login-experience/cinematic-login"
import { supabase, supabaseConfigurationError } from "@/lib/supabase"

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F6F7F5] px-4 text-center">
      <div>
        <ShieldCheck className="mx-auto mb-3 size-8 text-[#0F6E6E]" aria-hidden="true" />
        <p className="text-sm text-slate-500">Checking your secure session…</p>
      </div>
    </main>
  )
}

function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!supabase || isSubmitting) return

    setError("")
    setIsSubmitting(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setIsSubmitting(false)

    if (signInError) {
      setError(signInError.message)
    }
  }

  if (supabaseConfigurationError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F7F5] px-4 py-10 text-center">
        <p className="max-w-md rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {supabaseConfigurationError}
        </p>
      </main>
    )
  }

  return (
    <CinematicLogin
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      error={error}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  )
}

export function AuthGate({ children }) {
  const [session, setSession] = useState(() => (supabase ? undefined : null))

  useEffect(() => {
    if (!supabase) return undefined

    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  if (session === undefined) return <LoadingScreen />
  if (!session) return <SignInForm />

  return children({ user: session.user, signOut })
}
