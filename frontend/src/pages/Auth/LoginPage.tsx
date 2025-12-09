import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Card } from '@/components/UI'
import { useAuthStore } from '@/stores/authStore'
import { handleApiError } from '@/services/api'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(handleApiError(err))
    }
  }

  return (
    <Card className="mt-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-semibold text-center text-gray-900">
          登录
        </h2>

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

        <Input
          label="密码"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            忘记密码？
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={isLoading}>
          登录
        </Button>

        <p className="text-center text-sm text-gray-600">
          还没有账号？{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-500">
            注册
          </Link>
        </p>
      </form>
    </Card>
  )
}
