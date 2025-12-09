import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Card } from '@/components/UI'
import { useAuthStore } from '@/stores/authStore'
import { handleApiError } from '@/services/api'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

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

    try {
      await register(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(handleApiError(err))
    }
  }

  return (
    <Card className="mt-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-semibold text-center text-gray-900">
          注册
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
          autoComplete="new-password"
        />

        <Input
          label="确认密码"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />

        <Button type="submit" className="w-full" loading={isLoading}>
          注册
        </Button>

        <p className="text-center text-sm text-gray-600">
          已有账号？{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-500">
            登录
          </Link>
        </p>
      </form>
    </Card>
  )
}
