import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, LogOut, ChevronRight } from 'lucide-react'
import { adminApi } from '../lib/adminApi'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/produtos', label: 'Produtos', icon: Package },
  { to: '/admin/categorias', label: 'Categorias', icon: Tags },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { to: '/admin/utilizadores', label: 'Utilizadores', icon: Users },
]

function useBreadcrumb(): string[] {
  const { pathname } = useLocation()
  const parts = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean)
  const labels: Record<string, string> = {
    produtos: 'Produtos',
    categorias: 'Categorias',
    pedidos: 'Pedidos',
    utilizadores: 'Utilizadores',
    novo: 'Novo',
    editar: 'Editar',
  }
  const crumbs = ['Admin']
  parts.forEach((part) => {
    if (labels[part]) crumbs.push(labels[part])
    else if (/^\d+$/.test(part)) crumbs.push(`#${part}`)
    else crumbs.push(part)
  })
  return crumbs
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const crumbs = useBreadcrumb()
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
          <span className="font-body text-xs text-gray-400 truncate" title={email ?? undefined}>
            {email ?? '…'}
          </span>
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
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <nav className="flex items-center gap-1.5 font-body text-sm" aria-label="Localização atual">
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={14} className="text-gray-400" />}
                <span className={i === crumbs.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
          <span className="font-body text-xs text-gray-500 truncate">Sessão: {email ?? '…'}</span>
        </header>
        <main className="flex-1 p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}