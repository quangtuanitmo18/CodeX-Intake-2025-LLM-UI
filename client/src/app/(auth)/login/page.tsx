import { Metadata } from 'next'
import LoginForm from './login-form'
import Logout from './logout'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your account',
}

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginForm />
      <Logout />
    </div>
  )
}
