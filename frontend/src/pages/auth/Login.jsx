import { Navigate } from 'react-router-dom'

// The standalone login page is removed.
// Authentication is handled via the dropdown on the landing page (/).
export default function Login() {
  return <Navigate to="/" replace />
}
