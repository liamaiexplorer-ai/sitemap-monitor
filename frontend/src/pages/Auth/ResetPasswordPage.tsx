import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Button, Input, Card } from '@/components/UI'
import { api, handleApiError } from '@/services/api'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (password.length < 8) {
      setError('密码至少需要 8 个字符')
      return
    }

    setIsLoading(true)

    try {
      await api.post('/auth/password/reset', { token, new_password: password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <Card className="mt-8">
        <div className="text-center space-y-4">
          <div className="text-red-600">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            无效的重置链接
          </h2>
          <p className="text-gray-600">
            密码重置链接无效或已过期。请重新请求密码重置。
          </p>
          <Link
            to="/forgot-password"
            className="inline-block text-blue-600 hover:text-blue-500"
          >
            重新请求
          </Link>
        </div>
      </Card>
    )
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
            密码已重置
          </h2>
          <p className="text-gray-600">
            您的密码已成功重置。正在跳转到登录页面...
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="mt-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-semibold text-center text-gray-900">
          重置密码
        </h2>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <Input
          label="新密码"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />

        <Input
          label="确认新密码"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />

        <Button type="submit" className="w-full" loading={isLoading}>
          重置密码
        </Button>
      </form>
    </Card>
  )
}
