import React from 'react'
import { statusBadge } from '../lib/utils'

export default function OrderStatusBadge({ status }) {
  return <span className={statusBadge(status)}>{status}</span>
}
