import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input, Card } from '@/components/UI'
import { api, handleApiError } from '@/services/api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await api.post('/auth/password/reset-request', { email })
      setSuccess(true)
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="mt-8">
        <div className="text-center space-y-4">
          <div className="text-green-600">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            邮件已发送
          </h2>
          <p className="text-gray-600">
            如果该邮箱已注册，您将收到密码重置邮件。请检查您的收件箱。
          </p>
          <Link
            to="/login"
            className="inline-block text-blue-600 hover:text-blue-500"
          >
            返回登录
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <Card className="mt-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-semibold text-center text-gray-900">
          忘记密码
        </h2>
        <p className="text-sm text-gray-600 text-center">
          输入您的邮箱地址，我们将向您发送密码重置链接。
        </p>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <Input
          label="邮箱"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <Button type="submit" className="w-full" loading={isLoading}>
          发送重置链接
        </Button>

        <p className="text-center text-sm text-gray-600">
          <Link to="/login" className="text-blue-600 hover:text-blue-500">
            返回登录
          </Link>
        </p>
      </form>
    </Card>
  )
}
