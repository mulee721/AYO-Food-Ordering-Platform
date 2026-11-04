import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { restaurantsAPI } from '../../lib/api'
import { currency, statusBadge } from '../../lib/utils'
import { Search, Star, Clock, DollarSign } from 'lucide-react'

export default function CustomerRestaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [cuisine, setCuisine]         = useState('')
  const [sort, setSort]               = useState('rating')
  const [status, setStatus]           = useState('')

  useEffect(() => {
    setLoading(true)
    restaurantsAPI.getAll({ search: search || undefined, cuisine: cuisine || undefined, sort, status: status || undefined, limit: 50 })
      .then(r => setRestaurants(r.data.data || []))
      .catch(console.error).finally(() => setLoading(false))
  }, [sort, status, cuisine])

  const filtered = restaurants.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.cuisine.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout title="Browse Restaurants">
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9 text-sm" placeholder="Search restaurants or cuisine…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-40 text-sm" value={cuisine} onChange={e => setCuisine(e.target.value)}>
          <option value="">All Cuisines</option>
          {['Ethiopian Cuisine','Burgers','Pizza','Chicken','Vegetarian','Pasta','Snacks','Drinks'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="input w-36 text-sm" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="rating">Top Rated</option>
          <option value="time">Fastest</option>
          <option value="fee">Lowest Fee</option>
          <option value="reviews">Most Reviews</option>
        </select>
        <select className="input w-32 text-sm" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="Open">Open Now</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading restaurants…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(r => (
            <Link key={r._id} to={`/customer/restaurant/${r.slug}`}
              className="card hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer block group">
              <div className="h-44 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl bg-slate-100 relative">
                {r.image ? (
                  <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.onerror = null; e.target.style.display = 'none' }} />
                ) : <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>}
                <div className="absolute top-3 right-3">
                  <span className={statusBadge(r.status)}>{r.status}</span>
                </div>
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display font-bold text-slate-800">{r.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{r.cuisine}</p>
                </div>
                <span className="badge badge-blue text-xs flex-shrink-0">{r.priceLevel}</span>
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" />{r.rating}</span>
                <span className="flex items-center gap-1"><Clock size={12} />{r.time} min</span>
                <span className="flex items-center gap-1"><DollarSign size={12} />{r.fee} ETB delivery</span>
              </div>
            </Link>
          ))}
          {!filtered.length && <div className="col-span-3 text-center py-16 text-slate-400">No restaurants match your search.</div>}
        </div>
      )}
    </DashboardLayout>
  )
}
