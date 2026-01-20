'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Third Party Imports
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, type LoginSchema } from '@/utils/rules'

const Login = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const router = useRouter()
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const { login, isLoading, isAuthenticated, error, clearError } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  // Clear error when form data changes
  // Note: RHF handles error clearing for fields automatically.
  // We only need to clear the global auth error (like "Invalid credentials")
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit = async (data: LoginSchema) => {
    if (error) clearError()

    const success = await login({
      email: data.email,
      password: data.password,
      loginContext: 'admin'
    })

    if (success) {
      router.push('/')
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-5'>
            <div>
              <Typography variant='h4'>{`Chào mừng đến ${themeConfig.templateName}! 👋🏻`}</Typography>
              <Typography className='mbs-1'>Vui lòng đăng nhập để tiếp tục</Typography>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert severity='error' onClose={clearError}>
                {error}
              </Alert>
            )}

            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
              <TextField
                autoFocus
                fullWidth
                label='Email'
                type='email'
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
              />
              <TextField
                fullWidth
                label='Mật khẩu'
                id='outlined-adornment-password'
                type={isPasswordShown ? 'text' : 'password'}
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                        disabled={isLoading}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                    />
                  }
                  label='Ghi nhớ đăng nhập'
                />
                <Typography className='text-end' color='primary' component={Link} href='/forgot-password'>
                  Quên mật khẩu?
                </Typography>
              </div>
              <Button fullWidth variant='contained' type='submit' disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} color='inherit' /> : 'Đăng Nhập'}
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>Chưa có tài khoản?</Typography>
                <Typography component={Link} href='/register' color='primary'>
                  Đăng ký ngay
                </Typography>
              </div>
              <Divider className='gap-3'>hoặc</Divider>
              <div className='flex justify-center items-center gap-2'>
                <IconButton size='small' className='text-facebook' disabled={isLoading}>
                  <i className='ri-facebook-fill' />
                </IconButton>
                <IconButton size='small' className='text-twitter' disabled={isLoading}>
                  <i className='ri-twitter-fill' />
                </IconButton>
                <IconButton size='small' className='text-github' disabled={isLoading}>
                  <i className='ri-github-fill' />
                </IconButton>
                <IconButton size='small' className='text-googlePlus' disabled={isLoading}>
                  <i className='ri-google-fill' />
                </IconButton>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default Login
