/**
 * AYO Food Delivery — Luxury Landing Page
 * Palette: Ink #171717 · Gold #C9A45C · Ivory #F8F1E5 · Muted #777777
 * Supports: Dark Mode · Light Mode · Responsive
 */
import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { restaurantsAPI, dishesAPI, cartAPI, adminAPI, authAPI } from '../../lib/api'
import { currency } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import {
  Search, MapPin, Clock, Star, ChevronRight, Menu, X,
  ShoppingBag, Bike, Store, CheckCircle, ChevronDown, ArrowRight,
  Phone, Mail, Instagram, Twitter, Facebook, Package, Plus,
  Eye, EyeOff, LogIn, Loader2, Quote, Award, Sun, Moon,
  ArrowLeft, KeyRound,
} from 'lucide-react'

// ─── STATIC DATA ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'ethiopian',  label: 'Ethiopian',  emoji: '🍲', img: '/images/categories/ethiopian.jpg',  color: 'from-amber-800/80 to-amber-600/60' },
  { id: 'burgers',    label: 'Burgers',    emoji: '🍔', img: '/images/categories/burgers.jpg',    color: 'from-yellow-900/80 to-yellow-700/60' },
  { id: 'pizza',      label: 'Pizza',      emoji: '🍕', img: '/images/categories/pizza.jpg',      color: 'from-red-900/80 to-red-700/60' },
  { id: 'chicken',    label: 'Chicken',    emoji: '🍗', img: '/images/categories/chicken.jpg',    color: 'from-orange-900/80 to-orange-700/60' },
  { id: 'vegetarian', label: 'Healthy',    emoji: '🥗', img: '/images/categories/healthy.jpg',   color: 'from-green-900/80 to-green-700/60' },
  { id: 'drinks',     label: 'Drinks',     emoji: '🥤', img: '/images/categories/drinks.jpg',    color: 'from-blue-900/80 to-blue-700/60' },
  { id: 'pasta',      label: 'Pasta',      emoji: '🍝', img: '/images/categories/pasta.jpg',     color: 'from-stone-900/80 to-stone-700/60' },
  { id: 'snacks',     label: 'Snacks',     emoji: '🍟', img: '/images/categories/snacks.jpg',    color: 'from-zinc-900/80 to-zinc-700/60' },
]

const CAT_MAP = {
  ethiopian: 'Ethiopian Cuisine', burgers: 'Burgers', pizza: 'Pizza',
  chicken: 'Chicken', vegetarian: 'Vegetarian', drinks: 'Drinks',
  pasta: 'Pasta', snacks: 'Snacks',
}

const STEPS = [
  { icon: Search,      n: '01', title: 'Discover',      desc: 'Browse curated restaurants across Everywhere, filtered by cuisine and rating.' },
  { icon: ShoppingBag, n: '02', title: 'Order',         desc: 'Add to cart, apply promo codes, and check out in under 60 seconds.' },
  { icon: Bike,        n: '03', title: 'Track & Enjoy', desc: 'Follow your order through seven live stages from kitchen to doorstep.' },
]

const REVIEWS = [
  { name: 'Selamawit T.', role: 'Regular Customer',    rating: 5, text: 'Fastest delivery I have experienced in Addis. The injera from Selam Kitchen arrived still warm. Absolutely outstanding service.' },
  { name: 'Bereket A.',   role: 'Food Enthusiast',     rating: 5, text: 'AYO has transformed how I eat lunch. The restaurant variety is exceptional and live tracking makes the wait enjoyable.' },
  { name: 'Hiwot G.',     role: 'Working Professional', rating: 5, text: 'Ordering for my whole team is now a single tap. Promo codes save us money daily and the dashboards are beautifully designed.' },
]

const OFFERS_FALLBACK = [
  { code: 'MIRA50',   label: '50 ETB Off',    sub: 'On orders above 200 ETB', grad: 'linear-gradient(135deg,#171717,#2d2d2d)' },
  { code: 'TASTY20',  label: '20% Discount',  sub: 'On orders above 300 ETB', grad: 'linear-gradient(135deg,#A8823D,#C9A45C)' },
  { code: 'FREESHIP', label: 'Free Delivery', sub: 'On orders above 250 ETB', grad: 'linear-gradient(135deg,#1a3a2a,#2d6a4f)' },
]

const NAV_LINKS = [
  { label: 'Home',         href: '#home' },
  { label: 'Restaurants',  href: '#restaurants' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Offers',       href: '#offers' },
  { label: 'Reviews',      href: '#reviews' },
  { label: 'Contact',      href: '#contact' },
]

const FAQS = [
  { q: 'How do I place an order?',             a: 'Create a free account, browse restaurants, add dishes to your cart, and check out. You get a live tracking link instantly.' },
  { q: 'What payment methods are supported?',   a: 'Cash on Delivery, Telebirr, CBE Birr, and credit/debit cards are all supported at checkout.' },
  { q: 'How long does delivery take?',          a: 'Most restaurants in Everywhere deliver in 20–35 minutes. Estimated time is shown on every restaurant card.' },
  { q: 'Can I track my order in real time?',    a: 'Yes. You get a unique reference and can follow your order through all seven live status stages.' },
  { q: 'How do I list my restaurant on AYO?',  a: 'Contact us — our admin team sets up your restaurant dashboard and onboards your menu at no upfront cost.' },
  { q: 'Are there any registration fees?',      a: 'None. AYO charges 15% commission on delivered orders only. No monthly or setup fees.' },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-[#EDE3D0] dark:bg-white/10 rounded-2xl ${className}`} />
}

function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-3">
      <div className="w-10 h-px bg-[#C9A45C]/40" />
      <div className="w-1.5 h-1.5 rounded-full bg-[#C9A45C]" />
      <div className="w-10 h-px bg-[#C9A45C]/40" />
    </div>
  )
}

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect() } }, { threshold: 0.08 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${on ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </div>
  )
}

// ─── AUTH CONSTANTS (module-level — never redefined on re-render) ─────────────
const DEMO_ACCOUNTS = [
  { label: 'Admin',      e: 'admin@ayo.food',    p: 'admin1234' },
  { label: 'Restaurant', e: 'restaurant@ayo.food', p: 'demo1234' },
  { label: 'Courier',    e: 'courier@ayo.food',    p: 'demo1234' },
  { label: 'Customer',   e: 'customer@ayo.food',    p: 'demo1234' },
]
const INPUT_CLS = 'w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition focus:border-[#C9A45C] focus:ring-2 focus:ring-[#C9A45C]/20'
const INPUT_STYLE_LIGHT = { background: '#F8F1E5', borderColor: '#E2D5BE', color: '#111111' }
const INPUT_STYLE_DARK  = { background: '#2a2f3f', borderColor: '#3a4055', color: '#f0f0f0' }

// ─── AUTH PANEL (top-level component — stable identity across re-renders) ────
function AuthPanel({
  isMobile, isDark,
  tab, switchTab, closeDrop,
  // sign-in
  siEmail, setSiEmail, siPassword, setSiPassword, siShowPw, setSiShowPw,
  handleSignIn,
  // register
  rName, setRName, rEmail, setREmail, rPhone, setRPhone,
  rPassword, setRPassword, rShowPw, setRShowPw,
  rConfirm, setRConfirm, rShowCf, setRShowCf,
  handleRegister,
  // shared
  loading, error,
  // forgot-password flow
  fpStep, fpEmail, setFpEmail, fpOtp, setFpOtp,
  fpNewPw, setFpNewPw, fpShowNewPw, setFpShowNewPw,
  fpConfirm, setFpConfirm, fpShowConfirm, setFpShowConfirm,
  fpLoading, fpError, fpSuccess,
  handleForgotRequest, handleVerifyOtp, handleResetPassword, goToForgot, backToSignIn,
}) {
  const panelBg    = isDark ? '#1a1f2e'               : '#ffffff'
  const panelBorder= isDark ? 'rgba(255,255,255,0.1)' : '#E2D5BE'
  const divBorder  = isDark ? 'rgba(255,255,255,0.08)': '#EDE3D0'
  const tabInactive= isDark ? 'rgba(255,255,255,0.4)' : '#777777'
  const labelColor = isDark ? 'rgba(255,255,255,0.45)': '#777777'
  const textColor  = isDark ? '#f0f0f0'               : '#111111'
  const is         = isDark ? INPUT_STYLE_DARK : INPUT_STYLE_LIGHT

  return (
    <div className={`rounded-2xl overflow-hidden ${isMobile ? 'mx-4 mb-4 mt-2' : 'absolute right-0 top-full mt-3 w-[380px] z-50'}`}
      style={{ background: panelBg, border: `1px solid ${panelBorder}`, boxShadow: '0 12px 48px rgba(0,0,0,0.28)' }}>

      {/* Tab header — hidden during forgot-password flow */}
      {tab !== 'forgot' && (
        <div className="flex" style={{ borderBottom: `1px solid ${divBorder}` }}>
          {[['signin','Sign In'], ['register','Create Account']].map(([k, l]) => (
            <button key={k} onClick={() => switchTab(k)}
              style={{ color: tab === k ? '#C9A45C' : tabInactive, borderBottom: tab === k ? '2px solid #C9A45C' : '2px solid transparent' }}
              className="flex-1 py-3.5 text-sm font-semibold transition-colors">
              {l}
            </button>
          ))}
          <button onClick={closeDrop} style={{ color: tabInactive, borderLeft: `1px solid ${divBorder}` }} className="px-4">
            <X size={14} />
          </button>
        </div>
      )}
      {tab === 'forgot' && (
        <div className="flex items-center justify-between px-5 pt-4 pb-2" style={{ borderBottom: `1px solid ${divBorder}` }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
              style={{ background: fpStep >= 1 ? '#C9A45C' : divBorder, color: fpStep >= 1 ? '#171717' : tabInactive }}>1</div>
            <div className="w-8 h-px" style={{ background: fpStep >= 2 ? '#C9A45C' : divBorder }} />
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
              style={{ background: fpStep >= 2 ? '#C9A45C' : divBorder, color: fpStep >= 2 ? '#171717' : tabInactive }}>2</div>
            <div className="w-8 h-px" style={{ background: fpStep >= 3 ? '#C9A45C' : divBorder }} />
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
              style={{ background: fpStep >= 3 ? '#C9A45C' : divBorder, color: fpStep >= 3 ? '#171717' : tabInactive }}>3</div>
          </div>
          <button onClick={closeDrop} style={{ color: tabInactive }} className="p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── SIGN IN ── */}
      {tab === 'signin' && (
        <>
          <form onSubmit={handleSignIn} className="px-5 py-5 space-y-3.5">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">
                <X size={11} className="flex-shrink-0" /> {error}
              </div>
            )}
            <div>
              <label style={{ color: labelColor }} className="block text-[10px] font-bold uppercase tracking-widest mb-1.5">Email Address</label>
              <input type="email" autoComplete="email" placeholder="you@example.com"
                value={siEmail} onChange={e => setSiEmail(e.target.value)}
                className={INPUT_CLS} style={{ ...is, caretColor: '#C9A45C' }} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label style={{ color: labelColor }} className="block text-[10px] font-bold uppercase tracking-widest">Password</label>
                <button type="button" onClick={goToForgot}
                  className="text-[10px] font-semibold hover:underline" style={{ color: '#C9A45C' }}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input type={siShowPw ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••"
                  value={siPassword} onChange={e => setSiPassword(e.target.value)}
                  className={`${INPUT_CLS} pr-11`} style={{ ...is, caretColor: '#C9A45C' }} />
                <button type="button" onClick={() => setSiShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#999' }}>
                  {siShowPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-[#171717] rounded-xl active:scale-95 transition-all disabled:opacity-60 mt-1"
              style={{ background: '#C9A45C', boxShadow: '0 4px 20px rgba(201,164,92,0.35)' }}>
              {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : <><LogIn size={15} /> Sign In</>}
            </button>
          </form>

          <div className="px-5 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: labelColor }}>Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-1.5">
              {DEMO_ACCOUNTS.map(d => (
                <button key={d.label}
                  onClick={() => { setSiEmail(d.e); setSiPassword(d.p) }}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border transition text-left"
                  style={{ background: isDark ? '#2a2f3f' : '#F8F1E5', borderColor: isDark ? '#3a4055' : '#E2D5BE', color: textColor }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 pb-4 text-center pt-3" style={{ borderTop: `1px solid ${divBorder}` }}>
            <span className="text-xs" style={{ color: labelColor }}>No account? </span>
            <button onClick={() => switchTab('register')} className="text-xs font-bold text-[#C9A45C] hover:underline">Create one free →</button>
          </div>
        </>
      )}

      {/* ── REGISTER ── */}
      {tab === 'register' && (
        <>
          <form onSubmit={handleRegister} className="px-5 py-5 space-y-3.5">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">
                <X size={11} className="flex-shrink-0" /> {error}
              </div>
            )}
            <div>
              <label style={{ color: labelColor }} className="block text-[10px] font-bold uppercase tracking-widest mb-1.5">Full Name *</label>
              <input type="text" autoComplete="name" placeholder="Abebe Bikila"
                value={rName} onChange={e => setRName(e.target.value)}
                className={INPUT_CLS} style={{ ...is, caretColor: '#C9A45C' }} />
            </div>
            <div>
              <label style={{ color: labelColor }} className="block text-[10px] font-bold uppercase tracking-widest mb-1.5">Email Address *</label>
              <input type="email" autoComplete="email" placeholder="you@example.com"
                value={rEmail} onChange={e => setREmail(e.target.value)}
                className={INPUT_CLS} style={{ ...is, caretColor: '#C9A45C' }} />
            </div>
            <div>
              <label style={{ color: labelColor }} className="block text-[10px] font-bold uppercase tracking-widest mb-1.5">
                Phone <span className="normal-case font-normal">(optional)</span>
              </label>
              <input type="tel" autoComplete="tel" placeholder="+251 9xx xxx xxx"
                value={rPhone} onChange={e => setRPhone(e.target.value)}
                className={INPUT_CLS} style={{ ...is, caretColor: '#C9A45C' }} />
            </div>
            <div>
              <label style={{ color: labelColor }} className="block text-[10px] font-bold uppercase tracking-widest mb-1.5">Password *</label>
              <div className="relative">
                <input type={rShowPw ? 'text' : 'password'} autoComplete="new-password"
                  placeholder=" password " 
                  value={rPassword} onChange={e => setRPassword(e.target.value)}
                  className={`${INPUT_CLS} pr-11`}
                  style={{ ...is, caretColor: '#C9A45C', WebkitTextFillColor: is.color, WebkitBoxShadow: `0 0 0 1000px ${is.background} inset` }} />
                <button type="button" onClick={() => setRShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#999' }}>
                  {rShowPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ color: labelColor }} className="block text-[10px] font-bold uppercase tracking-widest mb-1.5">Confirm Password *</label>
              <div className="relative">
                <input type={rShowCf ? 'text' : 'password'} autoComplete="new-password"
                  placeholder="confirm password"
                  value={rConfirm} onChange={e => setRConfirm(e.target.value)}
                  className={`${INPUT_CLS} pr-11`}
                  style={{ ...is, caretColor: '#C9A45C', WebkitTextFillColor: is.color, WebkitBoxShadow: `0 0 0 1000px ${is.background} inset` }} />
                <button type="button" onClick={() => setRShowCf(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#999' }}>
                  {rShowCf ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {rPassword && rConfirm && rPassword !== rConfirm && (
                <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1"><X size={10} /> Passwords do not match</p>
              )}
              {rPassword && rConfirm && rPassword === rConfirm && (
                <p className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1"><CheckCircle size={10} /> Passwords match</p>
              )}
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-[#171717] rounded-xl active:scale-95 transition-all disabled:opacity-60 mt-1"
              style={{ background: '#C9A45C', boxShadow: '0 4px 20px rgba(201,164,92,0.35)' }}>
              {loading ? <><Loader2 size={15} className="animate-spin" /> Creating account…</> : 'Create Free Account'}
            </button>
          </form>
          <div className="px-5 pb-4 text-center pt-3" style={{ borderTop: `1px solid ${divBorder}` }}>
            <span className="text-xs" style={{ color: labelColor }}>Already have an account? </span>
            <button onClick={() => switchTab('signin')} className="text-xs font-bold text-[#C9A45C] hover:underline">Sign in →</button>
          </div>
        </>
      )}

      {/* ── FORGOT PASSWORD — Step 1: Request OTP ── */}
      {tab === 'forgot' && fpStep === 1 && (
        <div className="px-5 py-5 space-y-3.5">
          <div className="flex items-center gap-2 mb-1">
            <button onClick={backToSignIn} style={{ color: labelColor }} className="hover:text-[#C9A45C] transition-colors">
              <ArrowLeft size={15} />
            </button>
            <div>
              <p className="font-bold text-sm" style={{ color: textColor }}>Forgot Password</p>
              <p className="text-[11px]" style={{ color: labelColor }}>We'll email you a 6-digit reset code</p>
            </div>
          </div>
          {fpError && <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600"><X size={11}/>{fpError}</div>}
          {fpSuccess && <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-600"><CheckCircle size={11}/>{fpSuccess}</div>}
          <div>
            <label style={{ color: labelColor }} className="block text-[10px] font-bold uppercase tracking-widest mb-1.5">Email Address</label>
            <input type="email" autoComplete="email" placeholder="you@example.com"
              value={fpEmail} onChange={e => setFpEmail(e.target.value)}
              className={INPUT_CLS} style={{ ...is, caretColor: '#C9A45C' }} />
          </div>
          <button onClick={handleForgotRequest} disabled={fpLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-[#171717] rounded-xl active:scale-95 transition-all disabled:opacity-60"
            style={{ background: '#C9A45C', boxShadow: '0 4px 20px rgba(201,164,92,0.35)' }}>
            {fpLoading ? <><Loader2 size={14} className="animate-spin"/>Sending…</> : 'Send Reset Code'}
          </button>
        </div>
      )}

      {/* ── FORGOT PASSWORD — Step 2: Enter OTP ── */}
      {tab === 'forgot' && fpStep === 2 && (
        <div className="px-5 py-5 space-y-3.5">
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => { /* stay on step 2 but allow retry */ }} style={{ color: labelColor }}>
              <KeyRound size={15} />
            </button>
            <div>
              <p className="font-bold text-sm" style={{ color: textColor }}>Enter Reset Code</p>
              <p className="text-[11px]" style={{ color: labelColor }}>Check <strong>{fpEmail}</strong></p>
            </div>
          </div>
          {fpError && <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600"><X size={11}/>{fpError}</div>}
          {fpSuccess && <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-600"><CheckCircle size={11}/>{fpSuccess}</div>}
          <div>
            <label style={{ color: labelColor }} className="block text-[10px] font-bold uppercase tracking-widest mb-1.5">6-Digit Code</label>
            <input type="text" inputMode="numeric" maxLength={6} placeholder="● ● ● ● ● ●"
              value={fpOtp} onChange={e => setFpOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={INPUT_CLS}
              style={{ ...is, caretColor: '#C9A45C', letterSpacing: '0.35em', fontSize: '1.35rem', fontWeight: 800, textAlign: 'center' }} />
          </div>
          <button onClick={handleVerifyOtp} disabled={fpLoading || fpOtp.length !== 6}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-[#171717] rounded-xl active:scale-95 transition-all disabled:opacity-60"
            style={{ background: '#C9A45C', boxShadow: '0 4px 20px rgba(201,164,92,0.35)' }}>
            {fpLoading ? <><Loader2 size={14} className="animate-spin"/>Verifying…</> : 'Verify Code'}
          </button>
          <button onClick={handleForgotRequest} disabled={fpLoading}
            className="w-full text-xs font-semibold py-1 hover:underline" style={{ color: labelColor }}>
            Didn't receive it? Resend code
          </button>
        </div>
      )}

      {/* ── FORGOT PASSWORD — Step 3: New Password ── */}
      {tab === 'forgot' && fpStep === 3 && (
        <div className="px-5 py-5 space-y-3.5">
          <div className="mb-1">
            <p className="font-bold text-sm" style={{ color: textColor }}>Set New Password</p>
            <p className="text-[11px]" style={{ color: labelColor }}>Choose a strong password (min 6 characters)</p>
          </div>
          {fpError && <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600"><X size={11}/>{fpError}</div>}
          <div>
            <label style={{ color: labelColor }} className="block text-[10px] font-bold uppercase tracking-widest mb-1.5">New Password</label>
            <div className="relative">
              <input type={fpShowNewPw ? 'text' : 'password'} autoComplete="new-password" placeholder="New password"
                value={fpNewPw} onChange={e => setFpNewPw(e.target.value)}
                className={`${INPUT_CLS} pr-11`}
                style={{ ...is, caretColor: '#C9A45C', WebkitTextFillColor: is.color, WebkitBoxShadow: `0 0 0 1000px ${is.background} inset` }} />
              <button type="button" onClick={() => setFpShowNewPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#999' }}>
                {fpShowNewPw ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
          </div>
          <div>
            <label style={{ color: labelColor }} className="block text-[10px] font-bold uppercase tracking-widest mb-1.5">Confirm Password</label>
            <div className="relative">
              <input type={fpShowConfirm ? 'text' : 'password'} autoComplete="new-password" placeholder="Repeat password"
                value={fpConfirm} onChange={e => setFpConfirm(e.target.value)}
                className={`${INPUT_CLS} pr-11`}
                style={{ ...is, caretColor: '#C9A45C', WebkitTextFillColor: is.color, WebkitBoxShadow: `0 0 0 1000px ${is.background} inset` }} />
              <button type="button" onClick={() => setFpShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#999' }}>
                {fpShowConfirm ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
            {fpNewPw && fpConfirm && fpNewPw !== fpConfirm && (
              <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1"><X size={10}/>Passwords do not match</p>
            )}
            {fpNewPw && fpConfirm && fpNewPw === fpConfirm && (
              <p className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1"><CheckCircle size={10}/>Passwords match</p>
            )}
          </div>
          <button onClick={handleResetPassword} disabled={fpLoading || fpNewPw.length < 6 || fpNewPw !== fpConfirm}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-[#171717] rounded-xl active:scale-95 transition-all disabled:opacity-60"
            style={{ background: '#C9A45C', boxShadow: '0 4px 20px rgba(201,164,92,0.35)' }}>
            {fpLoading ? <><Loader2 size={14} className="animate-spin"/>Updating…</> : 'Update Password'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar() {
  const { login, register } = useAuth()
  const { isDark, toggle: toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [scrolled, setScrolled]   = useState(false)
  const [mobileOpen, setMobile]   = useState(false)
  const [dropOpen, setDropOpen]   = useState(false)
  const [tab, setTab]             = useState('signin')

  // Sign-in fields
  const [siEmail, setSiEmail]     = useState('')
  const [siPassword, setSiPassword] = useState('')
  const [siShowPw, setSiShowPw]   = useState(false)

  // Register fields
  const [rName, setRName]         = useState('')
  const [rEmail, setREmail]       = useState('')
  const [rPhone, setRPhone]       = useState('')
  const [rPassword, setRPassword] = useState('')
  const [rShowPw, setRShowPw]     = useState(false)
  const [rConfirm, setRConfirm]   = useState('')
  const [rShowCf, setRShowCf]     = useState(false)

  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  // ── Forgot-password state ──
  const [fpStep, setFpStep]           = useState(1)   // 1=request, 2=verify, 3=reset
  const [fpEmail, setFpEmail]         = useState('')
  const [fpOtp, setFpOtp]             = useState('')
  const [fpNewPw, setFpNewPw]         = useState('')
  const [fpShowNewPw, setFpShowNewPw] = useState(false)
  const [fpConfirm, setFpConfirm]     = useState('')
  const [fpShowConfirm, setFpShowConfirm] = useState(false)
  const [fpLoading, setFpLoading]     = useState(false)
  const [fpError, setFpError]         = useState('')
  const [fpSuccess, setFpSuccess]     = useState('')

  const dropRef = useRef(null)

  const resetAll = () => {
    setSiEmail(''); setSiPassword(''); setSiShowPw(false)
    setRName(''); setREmail(''); setRPhone(''); setRPassword(''); setRShowPw(false); setRConfirm(''); setRShowCf(false)
    setFpStep(1); setFpEmail(''); setFpOtp(''); setFpNewPw(''); setFpConfirm('')
    setFpShowNewPw(false); setFpShowConfirm(false); setFpError(''); setFpSuccess('')
    setError('')
  }

  const openDrop = (t = 'signin') => { resetAll(); setTab(t); setDropOpen(true) }
  const closeDrop = () => { setDropOpen(false); resetAll() }
  const switchTab = (t) => { resetAll(); setTab(t) }

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) closeDrop() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const scrollTo = (href) => {
    setMobile(false); closeDrop()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  const ROLE_MAP = { admin: '/admin', restaurant_owner: '/restaurant', delivery_agent: '/courier', customer: '/customer' }

  const handleSignIn = async (e) => {
    e.preventDefault()
    if (!siEmail || !siPassword) { setError('Enter your email and password.'); return }
    setLoading(true); setError('')
    try {
      const data = await login(siEmail, siPassword)
      navigate(ROLE_MAP[data.user.role] || '/customer')
    } catch (err) { setError(err?.response?.data?.message || 'Invalid credentials.') }
    finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!rName.trim())           { setError('Enter your full name.'); return }
    if (!rEmail)                 { setError('Enter your email.'); return }
    if (rPassword.length < 6)   { setError('Password must be at least 6 characters.'); return }
    if (rPassword !== rConfirm)  { setError('Passwords do not match.'); return }
    setLoading(true); setError('')
    try {
      await register(rName, rEmail, rPassword, rPhone)
      navigate('/customer')
    } catch (err) { setError(err?.response?.data?.message || 'Registration failed.') }
    finally { setLoading(false) }
  }

  // ── Forgot-password handlers ───────────────────────────────────────────────
  const goToForgot = () => {
    setFpStep(1); setFpEmail(siEmail); setFpOtp(''); setFpNewPw(''); setFpConfirm('')
    setFpError(''); setFpSuccess(''); setTab('forgot')
  }
  const backToSignIn = () => { setTab('signin'); setFpStep(1); setFpError(''); setFpSuccess('') }

  const handleForgotRequest = async () => {
    if (!fpEmail) { setFpError('Enter your email address.'); return }
    setFpLoading(true); setFpError(''); setFpSuccess('')
    try {
      await authAPI.forgotPassword(fpEmail)
      setFpSuccess('Reset code sent! Check your inbox (and spam folder).')
      setFpStep(2)
    } catch (err) { setFpError(err?.response?.data?.message || 'Failed to send code.') }
    finally { setFpLoading(false) }
  }

  const handleVerifyOtp = async () => {
    if (fpOtp.length !== 6) { setFpError('Enter the 6-digit code.'); return }
    setFpLoading(true); setFpError(''); setFpSuccess('')
    try {
      await authAPI.verifyOtp(fpEmail, fpOtp)
      setFpSuccess('Code verified! Set your new password.')
      setFpStep(3)
    } catch (err) { setFpError(err?.response?.data?.message || 'Invalid or expired code.') }
    finally { setFpLoading(false) }
  }

  const handleResetPassword = async () => {
    if (fpNewPw.length < 6) { setFpError('Password must be at least 6 characters.'); return }
    if (fpNewPw !== fpConfirm) { setFpError('Passwords do not match.'); return }
    setFpLoading(true); setFpError('')
    try {
      await authAPI.resetPassword(fpEmail, fpOtp, fpNewPw)
      setFpSuccess('Password updated! Signing you in…')
      // Auto sign-in with new password
      const data = await login(fpEmail, fpNewPw)
      navigate(ROLE_MAP[data.user.role] || '/customer')
    } catch (err) { setFpError(err?.response?.data?.message || 'Reset failed. Try again.') }
    finally { setFpLoading(false) }
  }

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled
        ? isDark
          ? 'bg-[#171717]/96 backdrop-blur-md shadow-[0_4px_32px_rgba(0,0,0,0.4)]'
          : 'bg-white/95 backdrop-blur-md shadow-[0_4px_32px_rgba(0,0,0,0.1)]'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#C9A45C] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-[#171717] font-black text-lg leading-none">A</span>
            </div>
              AYO <span className="text-[#C9A45C]">Food</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map(l => (
              <button key={l.label} onClick={() => scrollTo(l.href)}
                className={`px-3.5 py-2 text-sm font-medium transition-colors rounded-lg hover:text-[#C9A45C] ${scrolled && !isDark ? 'text-[#555]' : 'text-white/65'}`}>
                {l.label}
              </button>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-white/60 hover:text-[#C9A45C] hover:bg-white/8 transition-all"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Sign In dropdown */}
            <div className="relative" ref={dropRef}>
              <button onClick={() => dropOpen ? closeDrop() : openDrop('signin')}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all hover:text-[#C9A45C] ${scrolled && !isDark ? 'text-[#444]' : 'text-white/75'}`}>
                Sign In
                <ChevronDown size={13} className={`transition-transform duration-200 ${dropOpen && tab === 'signin' ? 'rotate-180 text-[#C9A45C]' : ''}`} />
              </button>
              {dropOpen && (
                <AuthPanel
                  isDark={isDark} tab={tab} switchTab={switchTab} closeDrop={closeDrop}
                  siEmail={siEmail} setSiEmail={setSiEmail} siPassword={siPassword} setSiPassword={setSiPassword}
                  siShowPw={siShowPw} setSiShowPw={setSiShowPw} handleSignIn={handleSignIn}
                  rName={rName} setRName={setRName} rEmail={rEmail} setREmail={setREmail}
                  rPhone={rPhone} setRPhone={setRPhone} rPassword={rPassword} setRPassword={setRPassword}
                  rShowPw={rShowPw} setRShowPw={setRShowPw} rConfirm={rConfirm} setRConfirm={setRConfirm}
                  rShowCf={rShowCf} setRShowCf={setRShowCf} handleRegister={handleRegister}
                  loading={loading} error={error}
                  fpStep={fpStep} fpEmail={fpEmail} setFpEmail={setFpEmail}
                  fpOtp={fpOtp} setFpOtp={setFpOtp}
                  fpNewPw={fpNewPw} setFpNewPw={setFpNewPw} fpShowNewPw={fpShowNewPw} setFpShowNewPw={setFpShowNewPw}
                  fpConfirm={fpConfirm} setFpConfirm={setFpConfirm} fpShowConfirm={fpShowConfirm} setFpShowConfirm={setFpShowConfirm}
                  fpLoading={fpLoading} fpError={fpError} fpSuccess={fpSuccess}
                  handleForgotRequest={handleForgotRequest} handleVerifyOtp={handleVerifyOtp}
                  handleResetPassword={handleResetPassword} goToForgot={goToForgot} backToSignIn={backToSignIn}
                />
              )}
            </div>

            {/* Get Started */}
            <button onClick={() => dropOpen && tab === 'register' ? closeDrop() : openDrop('register')}
              className="px-5 py-2.5 text-sm font-bold rounded-xl text-[#171717] active:scale-95 transition-all"
              style={{ background: '#C9A45C', boxShadow: '0 4px 20px rgba(201,164,92,0.35)' }}>
              Get Started
            </button>
          </div>

          {/* Mobile buttons */}
          <div className="lg:hidden flex items-center gap-1">
            <button onClick={toggleTheme}
              className={`w-9 h-9 flex items-center justify-center rounded-xl hover:text-[#C9A45C] ${scrolled && !isDark ? 'text-[#444]' : 'text-white/70'}`}>
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button onClick={() => { setMobile(v => !v); closeDrop() }}
              className={`p-2 rounded-xl hover:text-[#C9A45C] ${scrolled && !isDark ? 'text-[#444]' : 'text-white'}`}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className={`lg:hidden border-t max-h-[90vh] overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-[#171717] border-white/10' : 'bg-white border-black/8'}`}>
          <nav className="px-4 pt-4 pb-3 space-y-0.5">
            {NAV_LINKS.map(l => (
              <button key={l.label} onClick={() => scrollTo(l.href)}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:text-[#C9A45C] rounded-xl transition-colors ${isDark ? 'text-white/65 hover:bg-white/5' : 'text-[#555] hover:bg-black/4'}`}>
                {l.label}
              </button>
            ))}
          </nav>
          <AuthPanel
            isMobile isDark={isDark} tab={tab} switchTab={switchTab} closeDrop={closeDrop}
            siEmail={siEmail} setSiEmail={setSiEmail} siPassword={siPassword} setSiPassword={setSiPassword}
            siShowPw={siShowPw} setSiShowPw={setSiShowPw} handleSignIn={handleSignIn}
            rName={rName} setRName={setRName} rEmail={rEmail} setREmail={setREmail}
            rPhone={rPhone} setRPhone={setRPhone} rPassword={rPassword} setRPassword={setRPassword}
            rShowPw={rShowPw} setRShowPw={setRShowPw} rConfirm={rConfirm} setRConfirm={setRConfirm}
            rShowCf={rShowCf} setRShowCf={setRShowCf} handleRegister={handleRegister}
            loading={loading} error={error}
            fpStep={fpStep} fpEmail={fpEmail} setFpEmail={setFpEmail}
            fpOtp={fpOtp} setFpOtp={setFpOtp}
            fpNewPw={fpNewPw} setFpNewPw={setFpNewPw} fpShowNewPw={fpShowNewPw} setFpShowNewPw={setFpShowNewPw}
            fpConfirm={fpConfirm} setFpConfirm={setFpConfirm} fpShowConfirm={fpShowConfirm} setFpShowConfirm={setFpShowConfirm}
            fpLoading={fpLoading} fpError={fpError} fpSuccess={fpSuccess}
            handleForgotRequest={handleForgotRequest} handleVerifyOtp={handleVerifyOtp}
            handleResetPassword={handleResetPassword} goToForgot={goToForgot} backToSignIn={backToSignIn}
          />
        </div>
      )}
    </header>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ onSearch, isDark }) {
  const [query, setQuery] = useState('')
  const submit = (e) => {
    e.preventDefault()
    if (query.trim()) onSearch(query.trim())
    else document.querySelector('#restaurants')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Theme-aware colours
  const heroBg       = isDark ? '#171717' : '#fdfaf5'
  const gradRight    = isDark
    ? 'linear-gradient(to right,#171717 40%,rgba(23,23,23,0.75) 70%,rgba(23,23,23,0.35))'
    : 'linear-gradient(to right,#fdfaf5 30%,rgba(253,250,245,0.7) 60%,rgba(253,250,245,0.1))'
  const gradBottom   = isDark
    ? 'linear-gradient(to top,#171717 0%,transparent 55%)'
    : 'linear-gradient(to top,#fdfaf5 0%,transparent 55%)'
  const headlineColor = isDark ? 'white' : '#111111'
  const subColor      = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(23,23,23,0.65)'
  const searchBg      = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(23,23,23,0.06)'
  const searchBorder  = isDark ? 'rgba(255,255,255,0.12)'  : 'rgba(23,23,23,0.12)'
  const searchInputCls= isDark ? 'flex-1 bg-transparent text-sm text-white outline-none py-1.5 placeholder-white/35'
                                : 'flex-1 bg-transparent text-sm text-[#111] outline-none py-1.5 placeholder-[#888]'
  const outlineBtnBorder = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(23,23,23,0.25)'
  const outlineBtnColor  = isDark ? 'white' : '#111111'
  const statValColor     = '#C9A45C'
  const statLabelColor   = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(23,23,23,0.5)'
  const statDivider      = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23,23,23,0.12)'
  const floatingCardBg   = isDark ? '#171717' : '#ffffff'
  const floatingCardBorder = isDark ? 'rgba(201,164,92,0.25)' : 'rgba(201,164,92,0.4)'
  const floatingCardShadow = isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.1)'
  const floatingTextMain   = isDark ? 'white' : '#111111'
  const floatingTextSub    = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(23,23,23,0.45)'
  const imgOverlay         = isDark
    ? 'linear-gradient(to top,rgba(23,23,23,0.7) 0%,transparent 60%)'
    : 'linear-gradient(to top,rgba(253,250,245,0.8) 0%,transparent 60%)'
  const imgOpacity = isDark ? 'opacity-20' : 'opacity-30'

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden transition-colors duration-300"
      style={{ background: heroBg }}>
      <div className="absolute inset-0">
        <img src="/images/hero.jpg"
          alt="" className={`w-full h-full object-cover ${imgOpacity} transition-opacity duration-300`} />
        <div className="absolute inset-0 transition-all duration-300" style={{ background: gradRight }} />
        <div className="absolute inset-0 transition-all duration-300" style={{ background: gradBottom }} />
      </div>
      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: 'linear-gradient(to right,transparent,rgba(201,164,92,0.4),transparent)' }} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border"
              style={{ borderColor: 'rgba(201,164,92,0.35)', background: 'rgba(201,164,92,0.08)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A45C] animate-pulse" />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#C9A45C' }}>
                Everywhere · Premium Food Delivery
              </span>
            </div>

            <h1 className="font-display font-black tracking-tight leading-[1.05] transition-colors duration-300"
              style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)', color: headlineColor }}>
              Your City.<br />
              <span className="italic" style={{ color: '#C9A45C' }}>Your Food.</span><br />
              Delivered in Style.
            </h1>

            <p className="text-lg leading-relaxed max-w-lg transition-colors duration-300" style={{ color: subColor }}>
              Discover authentic Ethiopian feasts, artisanal burgers, and wood-fired pizzas — delivered hot to your doorstep in under 35 minutes.
            </p>

            <form onSubmit={submit} className="flex items-center max-w-xl gap-2 rounded-2xl pl-5 pr-2 py-2 transition-all duration-300"
              style={{ background: searchBg, border: `1px solid ${searchBorder}` }}>
              <Search size={17} style={{ color: '#C9A45C' }} className="flex-shrink-0" />
              <input className={searchInputCls}
                placeholder="Search restaurants, dishes, cuisine…"
                value={query} onChange={e => setQuery(e.target.value)} />
              <button type="submit" className="flex-shrink-0 px-5 py-2.5 text-sm font-bold rounded-xl active:scale-95 transition-all"
                style={{ background: '#C9A45C', color: '#171717', boxShadow: '0 4px 20px rgba(201,164,92,0.35)' }}>
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-4">
              <button onClick={() => document.querySelector('#restaurants')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold rounded-2xl active:scale-95 transition-all"
                style={{ background: '#C9A45C', color: '#171717', boxShadow: '0 4px 24px rgba(201,164,92,0.35)' }}>
                Explore Restaurants <ArrowRight size={16} />
              </button>
              <button onClick={() => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold rounded-2xl active:scale-95 transition-all"
                style={{ border: `1px solid ${outlineBtnBorder}`, color: outlineBtnColor }}>
                How It Works
              </button>
            </div>

            <div className="flex flex-wrap gap-8 pt-2 transition-colors duration-300"
              style={{ borderTop: `1px solid ${statDivider}` }}>
              {[['8+','Restaurants'],['19+','Menu Items'],['~25 min','Avg Delivery'],['4.9★','Rating']].map(([v,l]) => (
                <div key={l}>
                  <p className="font-display font-black text-xl leading-none" style={{ color: statValColor }}>{v}</p>
                  <p className="text-xs mt-1 transition-colors duration-300" style={{ color: statLabelColor }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image collage — desktop only */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-8 rounded-3xl overflow-hidden transition-all duration-300"
                style={{ border: '1px solid rgba(201,164,92,0.2)', boxShadow: isDark ? '0 8px 48px rgba(23,23,23,0.6)' : '0 8px 48px rgba(0,0,0,0.15)', animation: 'floatY 5s ease-in-out infinite' }}>
                <img src="/images/hero-dish.jpg"
                  alt="Featured dish" className="w-full h-full object-cover" />
                <div className="absolute inset-0 transition-all duration-300" style={{ background: imgOverlay }} />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#C9A45C' }}>Featured Today</p>
                  <p className="font-display font-bold text-base" style={{ color: isDark ? 'white' : '#111' }}>Royal Beyaynetu Platter</p>
                </div>
              </div>
              {/* Floating card: status */}
              <div className="absolute top-3 -left-3 rounded-2xl px-4 py-3 flex items-center gap-3 transition-all duration-300"
                style={{ background: floatingCardBg, border: `1px solid ${floatingCardBorder}`, boxShadow: floatingCardShadow }}>
                <div className="w-8 h-8 rounded-xl text-base flex items-center justify-center" style={{ background: 'rgba(201,164,92,0.15)' }}>🍲</div>
                <div>
                  <p className="text-[11px] font-bold transition-colors duration-300" style={{ color: floatingTextMain }}>On the Way</p>
                  <p className="text-[10px]" style={{ color: '#C9A45C' }}>Est. 12 min</p>
                </div>
              </div>
              {/* Floating card: rating */}
              <div className="absolute bottom-2 -right-3 rounded-2xl px-4 py-3 flex items-center gap-2 transition-all duration-300"
                style={{ background: floatingCardBg, border: `1px solid ${floatingCardBorder}`, boxShadow: floatingCardShadow }}>
                <Star size={13} style={{ color: '#C9A45C', fill: '#C9A45C' }} />
                <div>
                  <p className="text-xs font-black transition-colors duration-300" style={{ color: floatingTextMain }}>4.9 / 5.0</p>
                  <p className="text-[10px] transition-colors duration-300" style={{ color: floatingTextSub }}>1,200+ orders</p>
                </div>
              </div>
              {/* Floating card: delivery */}
              <div className="absolute top-1/2 -right-4 -translate-y-1/2 rounded-2xl px-4 py-2.5"
                style={{ background: '#C9A45C', boxShadow: '0 4px 24px rgba(201,164,92,0.4)' }}>
                <p className="text-[10px] font-semibold" style={{ color: 'rgba(23,23,23,0.65)' }}>Avg Delivery</p>
                <p className="font-black text-sm" style={{ color: '#171717' }}>25 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── STATS TICKER ─────────────────────────────────────────────────────────────
function StatsTicker({ stats }) {
  const items = [
    { v: stats?.restaurants?.total ? `${stats.restaurants.total}+` : '8+',  l: 'Partner Restaurants', i: '🍽️' },
    { v: stats?.orders?.total      ? stats.orders.total.toLocaleString() : '500+', l: 'Orders Delivered', i: '📦' },
    { v: stats?.couriers?.total    ? `${stats.couriers.total}+` : '10+',   l: 'Active Couriers',   i: '🛵' },
    { v: '4.9 ★',                                                            l: 'Platform Rating',  i: '⭐' },
    { v: '< 35 min',                                                         l: 'Average Delivery', i: '⚡' },
  ]
  return (
    <div style={{ background: '#C9A45C' }} className="py-3.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-x-8 gap-y-2">
          {items.map(s => (
            <div key={s.l} className="flex items-center gap-2" style={{ color: '#171717' }}>
              <span className="text-lg leading-none">{s.i}</span>
              <span className="font-display font-black text-sm">{s.v}</span>
              <span className="text-xs" style={{ color: 'rgba(23,23,23,0.6)' }}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
function Categories({ onCategoryClick }) {
  return (
    <section className="py-20 bg-[#F8F1E5] dark:bg-[#111318] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2 text-[#C9A45C]">Explore by Cuisine</p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#171717] dark:text-white">Every Craving, Covered</h2>
            <GoldDivider />
          </div>
        </FadeIn>

        {/* 8-column beautiful image cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {CATEGORIES.map((cat, i) => (
            <FadeIn key={cat.id} delay={i * 60}>
              <button
                onClick={() => onCategoryClick(cat.id)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer w-full focus:outline-none"
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(201,164,92,0.35)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                style={{ transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)', aspectRatio: '3/4' }}
              >
                {/* Background food photo */}
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={e => { e.target.style.display = 'none' }}
                />

                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-70 group-hover:opacity-55 transition-opacity duration-300`} />

                {/* Gold border on hover */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#C9A45C] transition-all duration-300" />

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-3 px-1">
                  {/* Emoji badge */}
                  <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-xl mb-2 group-hover:bg-[#C9A45C]/90 group-hover:scale-110 transition-all duration-300 border border-white/20">
                    {cat.emoji}
                  </div>
                  <span className="text-white text-[11px] font-black text-center leading-tight tracking-wide drop-shadow-lg">
                    {cat.label}
                  </span>
                </div>
              </button>
            </FadeIn>
          ))}
        </div>

        {/* Mobile: scrollable pill row for small screens — shown below the grid */}
        <div className="flex gap-2 mt-6 overflow-x-auto scrollbar-hide pb-1 sm:hidden">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => onCategoryClick(cat.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-white dark:bg-[#1a1f2e] border border-[#EDE3D0] dark:border-white/10 text-[#171717] dark:text-white hover:border-[#C9A45C] hover:text-[#C9A45C] transition-all"
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── RESTAURANT CARD ─────────────────────────────────────────────────────────
function RestaurantCard({ r, delay = 0 }) {
  // Use local restaurant images as fallback, mapped by index
  const localFallbacks = ['/images/restaurants/r1.jpg','/images/restaurants/r2.jpg','/images/restaurants/r3.jpg','/images/restaurants/r4.jpg']
  const fb = localFallbacks[Math.abs((r.name?.charCodeAt(0) || 0) % localFallbacks.length)]
  return (
    <FadeIn delay={delay}>
      <div className="group rounded-3xl overflow-hidden bg-white dark:bg-[#1a1f2e] border border-[#EDE3D0] dark:border-white/8 hover:border-[#C9A45C] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,164,92,0.18)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
        <div className="h-44 overflow-hidden relative bg-[#EDE3D0] dark:bg-white/5">
          <img src={r.image?.startsWith('http') ? r.image : fb} alt={r.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.src = fb }} />
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${r.status === 'Open' ? 'bg-emerald-500 text-white' : 'bg-black/70 text-white/80'}`}>
              {r.status}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(201,164,92,0.9)', color: '#171717' }}>
              {r.priceLevel}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-display font-bold text-base truncate text-[#171717] dark:text-white group-hover:text-[#C9A45C] transition-colors">{r.name}</h3>
          <p className="text-xs text-[#777] mt-0.5 truncate">{r.cuisine}</p>
          <div className="flex items-center justify-between mt-3 text-xs text-[#777]">
            <span className="flex items-center gap-1">
              <Star size={11} style={{ color: '#C9A45C', fill: '#C9A45C' }} />
              <span className="font-semibold text-[#171717] dark:text-white">{r.rating}</span>({r.reviewsCount})
            </span>
            <span className="flex items-center gap-1"><Clock size={11} />{r.time} min</span>
            <span className="flex items-center gap-1"><MapPin size={10} />{r.fee} ETB</span>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}

// ─── RESTAURANTS SECTION ─────────────────────────────────────────────────────
function RestaurantsSection({ restaurants, loading, searchQuery, onClearSearch }) {
  return (
    <section id="restaurants" className="py-20 bg-white dark:bg-[#0f1117] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1 text-[#C9A45C]">Curated for You</p>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-[#171717] dark:text-white">
                {searchQuery ? `Results for "${searchQuery}"` : 'Top Restaurants Near You'}
              </h2>
              {searchQuery && (
                <button onClick={onClearSearch} className="mt-1.5 text-xs font-semibold flex items-center gap-1 hover:underline text-[#C9A45C]">
                  <X size={11} /> Clear search
                </button>
              )}
            </div>
          </div>
        </FadeIn>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-3xl overflow-hidden border border-[#EDE3D0] dark:border-white/8">
                <Skeleton className="h-44 rounded-none" />
                <div className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : !restaurants.length ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-[#777]">No restaurants found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
            {searchQuery && <button onClick={onClearSearch} className="mt-3 text-sm font-semibold hover:underline text-[#C9A45C]">Show all restaurants</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {restaurants.map((r, i) => <RestaurantCard key={r._id} r={r} delay={i * 60} />)}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── DISH CARD ────────────────────────────────────────────────────────────────
function DishCard({ dish, delay = 0 }) {
  const [added, setAdded] = useState(false)
  // Map category to local image fallback
  const catImgMap = {
    'Ethiopian Cuisine': '/images/categories/ethiopian.jpg',
    'Burgers':           '/images/categories/burgers.jpg',
    'Pizza':             '/images/categories/pizza.jpg',
    'Chicken':           '/images/categories/chicken.jpg',
    'Vegetarian':        '/images/categories/healthy.jpg',
    'Drinks':            '/images/categories/drinks.jpg',
    'Pasta':             '/images/categories/pasta.jpg',
    'Snacks':            '/images/categories/snacks.jpg',
  }
  const fb = catImgMap[dish.category] || '/images/categories/ethiopian.jpg'
  return (
    <FadeIn delay={delay}>
      <div className="group rounded-3xl overflow-hidden bg-white dark:bg-[#1a1f2e] border border-[#EDE3D0] dark:border-white/8 hover:border-[#C9A45C] hover:-translate-y-1.5 transition-all duration-300"
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,164,92,0.18)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
        <div className="h-36 overflow-hidden relative bg-[#EDE3D0] dark:bg-white/5">
          <img src={dish.image?.startsWith('http') ? dish.image : fb} alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.src = fb }} />
          {dish.isPopular && <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: '#C9A45C', color: '#171717' }}>Popular</div>}
          {!dish.available && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(23,23,23,0.55)' }}>
              <span className="bg-white text-xs font-bold px-3 py-1 rounded-full text-[#171717]">Sold Out</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="font-display font-bold text-sm truncate text-[#171717] dark:text-white group-hover:text-[#C9A45C] transition-colors">{dish.name}</p>
          <p className="text-[11px] text-[#777] truncate mt-0.5">{dish.restaurant}</p>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-black text-base" style={{ color: '#C9A45C' }}>{currency(dish.price)}</span>
              {dish.originalPrice && <span className="text-xs line-through ml-1.5" style={{ color: 'rgba(119,119,119,0.6)' }}>{currency(dish.originalPrice)}</span>}
            </div>
            {dish.available && (
              <button onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 1800) }}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={{ background: added ? '#10b981' : '#C9A45C', boxShadow: '0 2px 12px rgba(201,164,92,0.3)' }}>
                {added ? <CheckCircle size={13} className="text-white" /> : <Plus size={13} style={{ color: '#171717' }} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </FadeIn>
  )
}

// ─── POPULAR DISHES ───────────────────────────────────────────────────────────
function PopularDishes({ dishes, loading }) {
  return (
    <section className="py-20 bg-[#F8F1E5] dark:bg-[#111318] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-12">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1 text-[#C9A45C]">Freshly Crafted</p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#171717] dark:text-white">Most Loved Dishes</h2>
            <GoldDivider />
          </div>
        </FadeIn>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-3xl overflow-hidden border border-[#EDE3D0] dark:border-white/8">
                <Skeleton className="h-36 rounded-none" /><div className="p-4"><Skeleton className="h-3 w-3/4" /></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {dishes.slice(0, 10).map((d, i) => <DishCard key={d._id} dish={d} delay={i * 50} />)}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── SPECIAL OFFERS ───────────────────────────────────────────────────────────
function SpecialOffers({ promos, isDark }) {
  const display = promos.length ? promos.slice(0, 3) : OFFERS_FALLBACK.map(o => ({ code: o.code, _label: o.label, _sub: o.sub, _grad: o.grad }))
  const sectionBg = isDark ? '#171717' : '#1a1a2e'  // keep dark-ish in both modes — offers section stays premium dark
  // Actually for light mode, use a deep navy so the white promo cards are readable
  const bg = isDark ? '#171717' : '#0f1629'
  return (
    <section id="offers" className="py-20 relative overflow-hidden transition-colors duration-300" style={{ background: bg }}>
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'rgba(201,164,92,0.07)', filter: 'blur(60px)' }} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2 text-[#C9A45C]">Exclusive Deals</p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white">Special Offers</h2>
            <GoldDivider />
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {display.map((p, i) => {
            const fb = OFFERS_FALLBACK[i] || OFFERS_FALLBACK[0]
            const label = p.type === 'percentage' ? `${p.value}% OFF` : p.type === 'fixed' ? `${p.value} ETB OFF` : p.type === 'free_delivery' ? 'Free Delivery' : (p._label || fb.label)
            return (
              <FadeIn key={p.code || i} delay={i * 80}>
                <div className="rounded-3xl p-7 relative overflow-hidden border border-white/8 hover:-translate-y-1 transition-all duration-300"
                  style={{ background: p._grad || fb.grad }}>
                  <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.12)' }}>
                      <Award size={11} style={{ color: '#C9A45C' }} />
                      <span className="text-white text-[10px] font-bold uppercase tracking-wider">Promo</span>
                    </div>
                    <p className="text-white font-display font-black text-2xl mb-1">{label}</p>
                    <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>{p.description || p._sub || fb.sub}</p>
                    <div className="flex items-center justify-between">
                      <div className="rounded-xl px-4 py-2" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}>
                        <p className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>Code</p>
                        <p className="font-mono font-black text-sm" style={{ color: '#C9A45C' }}>{p.code}</p>
                      </div>
                      <button onClick={() => { navigator.clipboard?.writeText(p.code); }}
                        className="text-xs font-bold hover:underline" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Copy →
                      </button>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-[#F8F1E5] dark:bg-[#111318] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2 text-[#C9A45C]">Simple & Seamless</p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#171717] dark:text-white">How AYO Works</h2>
            <GoldDivider />
            <p className="text-sm mt-3 max-w-sm mx-auto text-[#777]">From craving to delivery in three elegant steps</p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            return (
              <FadeIn key={s.n} delay={i * 100}>
                <div className="group flex flex-col items-center text-center p-8 rounded-3xl bg-white dark:bg-[#1a1f2e] border border-[#EDE3D0] dark:border-white/8 hover:border-[#C9A45C] hover:-translate-y-1.5 transition-all duration-300"
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,164,92,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(201,164,92,0.1)' }}>
                      <Icon size={26} style={{ color: '#C9A45C' }} />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                      style={{ background: '#171717', color: '#C9A45C', border: '1px solid rgba(201,164,92,0.3)' }}>
                      {s.n}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2 text-[#171717] dark:text-white">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-[#777]">{s.desc}</p>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── CUSTOMER REVIEWS ─────────────────────────────────────────────────────────
function CustomerReviews({ isDark }) {
  const bg = isDark ? '#171717' : '#f0ebe0'
  const headingColor = isDark ? 'white' : '#111111'
  const cardBg       = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)'
  const cardBorder   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(201,164,92,0.2)'
  const textColor    = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(23,23,23,0.7)'
  const nameColor    = isDark ? 'white' : '#111111'
  const roleColor    = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(23,23,23,0.45)'
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(201,164,92,0.2)'

  return (
    <section id="reviews" className="py-20 relative overflow-hidden transition-colors duration-300" style={{ background: bg }}>
      <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'rgba(201,164,92,0.05)', filter: 'blur(60px)' }} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2 text-[#C9A45C]">Voices of Our Community</p>
            <h2 className="font-display font-black text-3xl sm:text-4xl transition-colors duration-300" style={{ color: headingColor }}>What Customers Say</h2>
            <GoldDivider />
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((r, i) => (
            <FadeIn key={r.name} delay={i * 90}>
              <div className="p-7 rounded-3xl transition-all duration-300 hover:-translate-y-1"
                style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,164,92,0.4)'; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,1)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = cardBorder; e.currentTarget.style.background = cardBg }}>
                <div className="flex gap-0.5 mb-5">
                  {[...Array(r.rating)].map((_, k) => <Star key={k} size={13} style={{ color: '#C9A45C', fill: '#C9A45C' }} />)}
                </div>
                <Quote size={22} className="mb-3" style={{ color: 'rgba(201,164,92,0.3)' }} />
                <p className="text-sm leading-relaxed mb-6 transition-colors duration-300" style={{ color: textColor }}>{r.text}</p>
                <div className="flex items-center gap-3 pt-4 transition-colors duration-300" style={{ borderTop: `1px solid ${dividerColor}` }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: 'rgba(201,164,92,0.18)', color: '#C9A45C' }}>
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold transition-colors duration-300" style={{ color: nameColor }}>{r.name}</p>
                    <p className="text-xs transition-colors duration-300" style={{ color: roleColor }}>{r.role}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── PARTNER CTA ──────────────────────────────────────────────────────────────
function PartnerCTA({ isDark }) {
  return (
    <section className={`py-20 transition-colors duration-300 ${isDark ? 'bg-[#111318]' : 'bg-[#F8F1E5]'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl overflow-hidden relative" style={{ background: '#171717', border: '1px solid rgba(201,164,92,0.15)' }}>
          <div className="absolute inset-0 opacity-15">
            <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=70" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(23,23,23,0.98) 40%,rgba(23,23,23,0.85))' }} />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">
            <div className="p-10 lg:p-14" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(201,164,92,0.15)' }}>
                <Store size={22} style={{ color: '#C9A45C' }} />
              </div>
              <h3 className="font-display font-black text-white text-2xl mb-3">Own a Restaurant?</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
                List on AYO and reach thousands of customers across Everywhere. Full management dashboard, live order queue, and revenue analytics — no upfront fees.
              </p>
              <ul className="space-y-2 mb-8">
                {['No setup fees — 15% commission on delivered orders','Full menu management dashboard','Real-time kitchen order queue'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <CheckCircle size={13} style={{ color: '#C9A45C', flexShrink: 0 }} /> {item}
                  </li>
                ))}
              </ul>
              <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl active:scale-95 transition-all"
                style={{ background: '#C9A45C', color: '#171717', boxShadow: '0 4px 24px rgba(201,164,92,0.3)' }}>
                <Store size={15} /> Partner With Us
              </button>
            </div>
            <div className="p-10 lg:p-14">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(16,185,129,0.15)' }}>
                <Bike size={22} className="text-emerald-400" />
              </div>
              <h3 className="font-display font-black text-white text-2xl mb-3">Deliver with AYO</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Earn 35 ETB per delivery with flexible hours. Go online when you want, accept nearby orders, and track your earnings daily.
              </p>
              <ul className="space-y-2 mb-8">
                {['35 ETB base pay per delivery + tips','Flexible hours — go online anytime','Dedicated courier app with live tracking'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl active:scale-95 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
                <Bike size={15} /> Become a Courier
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null)
  const { isDark } = useTheme()
  const borderDef = isDark ? 'rgba(255,255,255,0.08)' : '#EDE3D0'
  return (
    <section className="py-20 bg-white dark:bg-[#0f1117] transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2 text-[#C9A45C]">Got Questions?</p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#171717] dark:text-white">Frequently Asked</h2>
            <GoldDivider />
          </div>
        </FadeIn>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <FadeIn key={i} delay={i * 50}>
              <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#1a1f2e] border transition-all"
                style={{ borderColor: open === i ? '#C9A45C' : borderDef, boxShadow: open === i ? '0 4px 24px rgba(201,164,92,0.15)' : 'none' }}>
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left">
                  <span className="font-semibold text-sm text-[#171717] dark:text-white">{f.q}</span>
                  <ChevronDown size={15} className={`flex-shrink-0 ml-3 transition-transform ${open === i ? 'rotate-180' : ''}`} style={{ color: '#C9A45C' }} />
                </button>
                {open === i && (
                  <div className="px-6 pb-5 dark:border-white/8" style={{ borderTop: `1px solid ${borderDef}` }}>
                    <p className="text-sm leading-relaxed pt-3 text-[#777]">{f.a}</p>
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <footer id="contact" style={{ background: '#171717' }} className="relative overflow-hidden">
      <div className="h-px w-full" style={{ background: 'linear-gradient(to right,transparent,rgba(201,164,92,0.5),transparent)' }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#C9A45C' }}>
                <span className="font-black text-lg leading-none" style={{ color: '#171717' }}>A</span>
              </div>
              <span className="font-display font-black text-xl text-white">AYO <span style={{ color: '#C9A45C' }}>Food</span></span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Everywhere's premium food ordering platform. Connecting great restaurants, reliable couriers, and hungry customers since 2024.
            </p>
            <div className="space-y-2.5 text-sm">
              {[[MapPin,'Everywhere, Ethiopia'],[Phone,'+251 900 000 000'],[Mail,'hello@ayofood.com']].map(([Icon,text]) => (
                <div key={text} className="flex items-center gap-2.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  <Icon size={13} style={{ color: '#C9A45C', flexShrink: 0 }} /><span>{text}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2.5 pt-1">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,164,92,0.18)'; e.currentTarget.style.borderColor = 'rgba(201,164,92,0.35)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
                  <Icon size={14} style={{ color: 'rgba(255,255,255,0.38)' }} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold text-white mb-4 text-sm">Navigate</h4>
            <ul className="space-y-2.5 text-sm">
              {NAV_LINKS.map(l => (
                <li key={l.label}>
                  <button onClick={() => scrollTo(l.href)}
                    className="transition-colors hover:underline"
                    style={{ color: 'rgba(255,255,255,0.38)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#C9A45C'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}>
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-white mb-4 text-sm">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              {[['Sign In','/login'],['Create Account','/register'],['For Restaurants','/register'],['For Couriers','/register'],['API Docs','/api/docs']].map(([l, to]) => (
                <li key={l}>
                  <Link to={to} style={{ color: 'rgba(255,255,255,0.38)' }} className="hover:underline transition-colors"
                    onMouseEnter={e => e.currentTarget.style.color = '#C9A45C'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}>
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} AYO Food Delivery. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <span>Privacy Policy</span>
            <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <span>Terms of Service</span>
            <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <span>Made with ❤️ everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isDark } = useTheme()
  const [restaurants, setRestaurants] = useState([])
  const [dishes, setDishes]           = useState([])
  const [promos, setPromos]           = useState([])
  const [platformStats, setPlatformStats] = useState(null)
  const [restLoading, setRestLoading] = useState(true)
  const [dishLoading, setDishLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCat, setActiveCat]     = useState('')

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    const token = localStorage.getItem('mira_token')
    if (token) adminAPI.dashboard().then(r => setPlatformStats(r.data)).catch(() => {})
    cartAPI.getPromos().then(r => setPromos(r.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    setRestLoading(true)
    const params = { limit: 8, sort: 'rating' }
    if (activeCat)   params.cuisine = activeCat
    if (searchQuery) params.search  = searchQuery
    restaurantsAPI.getAll(params)
      .then(r => setRestaurants(r.data?.data || []))
      .catch(() => setRestaurants([]))
      .finally(() => setRestLoading(false))
  }, [searchQuery, activeCat])

  useEffect(() => {
    setDishLoading(true)
    dishesAPI.getAll({ popularOnly: true, limit: 10 })
      .then(r => setDishes(r.data?.data || []))
      .catch(() => setDishes([]))
      .finally(() => setDishLoading(false))
  }, [])

  const handleSearch = (q) => {
    setSearchQuery(q); setActiveCat('')
    setTimeout(() => document.querySelector('#restaurants')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }
  const handleCategory = (id) => {
    setActiveCat(CAT_MAP[id] || id); setSearchQuery('')
    setTimeout(() => document.querySelector('#restaurants')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }
  const clearSearch = () => { setSearchQuery(''); setActiveCat('') }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
      <Navbar />
      <Hero onSearch={handleSearch} isDark={isDark} />
      <StatsTicker stats={platformStats} />
      <Categories onCategoryClick={handleCategory} />
      <RestaurantsSection
        restaurants={restaurants}
        loading={restLoading}
        searchQuery={searchQuery || activeCat}
        onClearSearch={clearSearch}
      />
      <PopularDishes dishes={dishes} loading={dishLoading} />
      <SpecialOffers promos={promos} isDark={isDark} />
      <HowItWorks />
      <CustomerReviews isDark={isDark} />
      <PartnerCTA isDark={isDark} />
      <FAQ />
      <Footer />
    </div>
  )
}
