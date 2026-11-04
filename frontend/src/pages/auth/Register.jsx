import { Navigate } from 'react-router-dom'

// The standalone register page is removed.
// Registration is handled via the dropdown on the landing page (/).
export default function Register() {
  return <Navigate to="/" replace />
}
