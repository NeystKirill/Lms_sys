import PageWrapper from '../../components/Layout/PageWrapper/PageWrapper'
import AuthCard from '../../components/Layout/AuthCard/AuthCard'
import RegisterHeader from './components/RegisterHeader/RegisterHeader'
import RegisterForm from './components/RegisterForm/RegisterForm'

export default function Register() {
  return (
    <PageWrapper>
      <AuthCard>
        <RegisterHeader />
        <RegisterForm />
      </AuthCard>
    </PageWrapper>
  )
}
