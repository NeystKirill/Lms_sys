import PageWrapper from '../../components/Layout/PageWrapper/PageWrapper'
import AuthCard from '../../components/Layout/AuthCard/AuthCard'
import LoginHeader from './components/LoginHeader/LoginHeader'
import LoginForm from './components/LoginForm/LoginForm'

export default function Login() {
  return (
    <PageWrapper>
      <AuthCard>
        <LoginHeader />
        <LoginForm />
      </AuthCard>
    </PageWrapper>
  )
}
