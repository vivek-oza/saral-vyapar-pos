import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Eye, EyeOff } from "lucide-react";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = t('common.email') + ' is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('common.email') + ' is invalid'
    }

    if (!formData.password) {
      newErrors.password = t('common.password') + ' is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const result = await login(formData.email, formData.password)

      if (result.success) {
        // Get user data from localStorage to get shop username
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        if (userData.shop?.username) {
          navigate(`/${userData.shop.username}/modules`)
        } else {
          // If no shop username, redirect to signup to complete shop setup
          navigate('/signup')
        }
      } else {
        setErrors({ general: result.error })
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('auth.loginTitle')}</CardTitle>
        {/* <CardDescription>
          {t('auth.loginSubtitle')}
        </CardDescription> */}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="text-destructive text-sm text-center p-3 bg-destructive/10 rounded-md">
              {errors.general}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('common.email')}
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              // placeholder={t('auth.enterEmail')}
              className={errors.email ? "border-destructive" : ""}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t('common.password')}
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                // placeholder={t('auth.enterPassword')}
                className={errors.password ? "border-destructive pr-10" : "pr-10"}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={loading}
              >
                {/* {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )} */}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password}</p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t('common.login') + '...' : t('common.login')}
          </Button>

          <div className="text-center space-y-2">
            <p>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                {t('common.forgotPassword')}
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              {t('common.dontHaveAccount')}{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                {t('common.signUpHere')}
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default LoginForm