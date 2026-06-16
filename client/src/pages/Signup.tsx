import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Modal from '../components/common/Modal'
import { useAuthStore } from '../store/authStore'

export default function Signup() {
  const [form, setForm] = useState({ email: '', password: '', name: '', university: '' })
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'signup' | 'verify'>('signup')
  const [userId, setUserId] = useState<string | null>(null)
  const { signup, verifyEmail, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const result = await signup(form)
      setUserId(result.userId)
      setStep('verify')
    } catch {
      // error handled by store
    }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await verifyEmail(form.email, otp)
      navigate('/login')
    } catch {
      // error handled by store
    }
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {step === 'signup' ? (
          <>
            <h1 className="text-2xl font-bold text-center text-gray-900">Create an account</h1>
            <p className="mt-2 text-center text-sm text-gray-500">
              Join with your .edu email
            </p>

            <form onSubmit={handleSignup} className="mt-8 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-campus-danger">
                  {error}
                  <button onClick={clearError} className="ml-2 font-medium hover:underline">
                    Dismiss
                  </button>
                </div>
              )}

              <Input
                label="Full name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />

              <Input
                label="University"
                type="text"
                placeholder="University of Example"
                value={form.university}
                onChange={(e) => updateField('university', e.target.value)}
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="you@university.edu"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                minLength={8}
                required
              />

              <Button type="submit" loading={isLoading} className="w-full">
                Create account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-campus-primary hover:underline">
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center text-gray-900">Verify your email</h1>
            <p className="mt-2 text-center text-sm text-gray-500">
              Enter the OTP sent to {form.email}
            </p>

            <form onSubmit={handleVerify} className="mt-8 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-campus-danger">
                  {error}
                </div>
              )}

              <Input
                label="OTP Code"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />

              <Button type="submit" loading={isLoading} className="w-full">
                Verify email
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
