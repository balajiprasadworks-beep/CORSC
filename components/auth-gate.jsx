"use client"

import { useEffect, useState } from "react"
import { LockKeyhole, LogIn, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F6F7F5] px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#0B1F3A] text-white">
            <LockKeyhole className="size-6" aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0F6E6E]">CORSC</p>
          <h1 className="mt-1 text-2xl font-bold text-[#0B1F3A]">Sign in to continue</h1>
          <p className="mt-2 text-sm text-slate-500">Use the account provided by your Supabase administrator.</p>
        </div>

        {supabaseConfigurationError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {supabaseConfigurationError}
          </p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">Email address</label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <Button className="h-11 w-full bg-[#0B1F3A] text-white hover:bg-[#123055]" disabled={isSubmitting} type="submit">
              <LogIn className="size-4" aria-hidden="true" />
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        )}
      </section>
    </main>
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
