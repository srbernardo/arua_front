import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, LogOut } from 'lucide-react'
import { adminApi } from '../lib/adminApi'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/produtos', label: 'Produtos', icon: Package },
  { to: '/admin/categorias', label: 'Categorias', icon: Tags },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { to: '/admin/utilizadores', label: 'Utilizadores', icon: Users },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const [email, setEmail] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let cancelled = false
    adminApi.getCurrentAdmin().then((admin) => {
      if (!cancelled) setEmail(admin ? admin.email : null)
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    // Navigate first (replace) so the browser back button can no longer
    // return to the admin section while the server session is torn down.
    navigate('/admin/login', { replace: true })
    try {
      await adminApi.logout()
    } catch {
      // Session teardown failed server-side; the loggedOut flag keeps the
      // login screen from bouncing back until the user signs in again.
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-60 shrink-0 bg-gray-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-gray-800">
          <span className="font-heading text-lg font-semibold">ARUA Admin</span>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-800 flex items-center justify-between gap-2">
          <span className="font-body text-xs text-gray-400 truncate">{email ?? '…'}</span>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Terminar sessão"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  )
}
