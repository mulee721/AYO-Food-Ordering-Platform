import { clsx } from 'clsx'

export function cn(...args) { return clsx(args) }

export function currency(n) {
  if (n == null) return '0 ETB'
  return `${Number(n).toLocaleString()} ETB`
}

export function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function fmtTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function fmtDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function timeAgo(d) {
  if (!d) return '—'
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function statusBadge(status) {
  const map = {
    'Delivered':        'badge-green',
    'Preparing':        'badge-yellow',
    'Ready for Pickup': 'badge-blue',
    'Courier Assigned': 'badge-blue',
    'Picked Up':        'badge-orange',
    'On the Way':       'badge-orange',
    'Pending Acceptance':'badge-gray',
    'Cancelled':        'badge-red',
    'Open':             'badge-green',
    'Closed':           'badge-gray',
    'Active':           'badge-green',
    'Suspended':        'badge-red',
    'Pending':          'badge-yellow',
  }
  return map[status] || 'badge-gray'
}

export function roleLabel(role) {
  const map = {
    customer: 'Customer',
    restaurant_owner: 'Restaurant Owner',
    delivery_agent: 'Courier',
    admin: 'Admin',
  }
  return map[role] || role
}

export function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function truncate(str, n = 30) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '…' : str
}
