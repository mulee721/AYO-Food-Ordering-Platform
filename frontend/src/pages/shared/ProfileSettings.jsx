import React, { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { usersAPI } from '../../lib/api'
import { getInitials, roleLabel } from '../../lib/utils'
import { User, Mail, Phone, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfileSettings() {
  const { user, refreshUser } = useAuth()
  const [form, setForm]       = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [saving, setSaving]   = useState(false)

  const save = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      await usersAPI.updateProfile(form)
      await refreshUser()
      toast.success('Profile updated!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <DashboardLayout title="Profile & Settings">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Avatar card */}
        <div className="card flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-slate-800">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="badge badge-blue mt-1">{roleLabel(user?.role)}</span>
          </div>
        </div>

        {/* Edit form */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Personal Information</h3>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5"><User size={13} /> Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5"><Mail size={13} /> Email Address</label>
              <input className="input bg-slate-50 cursor-not-allowed" value={user?.email} readOnly />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5"><Phone size={13} /> Phone Number</label>
              <input className="input" placeholder="+251 9xx xxx xxx" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <Save size={16} />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Account info */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Account Info</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Role',   roleLabel(user?.role)],
              ['Status', user?.status || 'Active'],
              ['Member Since', user?.createdAt ? new Date(user.createdAt).getFullYear() : '—'],
              ['Account ID', user?._id?.slice(-8) || '—'],
            ].map(([k, v]) => (
              <div key={k} className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">{k}</p>
                <p className="font-semibold text-slate-700">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
