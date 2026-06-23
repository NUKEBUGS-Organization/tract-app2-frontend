import { Navigate } from 'react-router-dom'

export default function LegalPage({ title }: { title: string }) {
  if (title === 'Privacy Policy') {
    return <Navigate to="/legal/privacy" replace />
  }
  return <Navigate to="/legal/terms" replace />
}
