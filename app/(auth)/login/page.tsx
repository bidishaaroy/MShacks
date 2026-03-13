'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Stethoscope, Building2, User, AlertCircle, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

const DEMO_ACCOUNTS = {
  doctor: { email: 'doctor@demo.com', password: 'password123', label: 'Doctor', role: 'DOCTOR' },
  admin: { email: 'admin@demo.com', password: 'password123', label: 'Admin', role: 'ADMIN' },
  patient: { email: 'patient@demo.com', password: 'password123', label: 'Patient', role: 'PATIENT' },
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  // Redirect if already logged in
  useEffect(() => {
    if (session?.user) {
      const role = session.user.role
      if (role === 'DOCTOR') router.push('/doctor')
      else if (role === 'ADMIN') router.push('/admin')
      else router.push('/patient')
    }
  }, [session, router])

  // Pre-fill demo account from URL params
  useEffect(() => {
    const demo = searchParams.get('demo') as keyof typeof DEMO_ACCOUNTS | null
    if (demo && DEMO_ACCOUNTS[demo]) {
      setValue('email', DEMO_ACCOUNTS[demo].email)
      setValue('password', DEMO_ACCOUNTS[demo].password)
    }
  }, [searchParams, setValue])

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemo = (type: keyof typeof DEMO_ACCOUNTS) => {
    const account = DEMO_ACCOUNTS[type]
    setValue('email', account.email)
    setValue('password', account.password)
    setError(null)
  }

  return (
    <Card className="shadow-lg border-gray-100 rounded-2xl">
      <CardHeader className="pb-0 pt-6 px-6">
        {/* Demo account quick-fill */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Quick demo access:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('doctor')}
              className="flex flex-col items-center gap-1 py-2 px-2 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-xs font-medium"
            >
              <Stethoscope className="h-4 w-4" />
              Doctor
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="flex flex-col items-center gap-1 py-2 px-2 rounded-xl border border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-xs font-medium"
            >
              <Building2 className="h-4 w-4" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('patient')}
              className="flex flex-col items-center gap-1 py-2 px-2 rounded-xl border border-green-100 bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-xs font-medium"
            >
              <User className="h-4 w-4" />
              Patient
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-400">or sign in manually</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-6 px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className="rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400"
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className="rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400"
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11 font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          Demo passwords: <code className="bg-gray-100 px-1 rounded">password123</code>
        </p>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to ClinAI Bridge</p>
        </div>

        <Suspense fallback={
          <Card className="shadow-lg border-gray-100 rounded-2xl">
            <CardContent className="pt-6 pb-6 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </CardContent>
          </Card>
        }>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Back to homepage
          </Link>
        </p>
      </div>
    </div>
  )
}
