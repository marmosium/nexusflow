import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Lock,
  LogOut,
  ChevronRight,
  Bell,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const modules = [
  {
    icon: Package,
    title: "Stok İşlemleri",
    description: "Stok işlemleri bu modül üzerinden gerçekleştirilir",
    color: "text-indigo-400",
    border: "hover:border-indigo-500/50",
    glow: "group-hover:bg-indigo-500/10",
    gradient: "from-indigo-500/20 to-transparent",
    href: "/stok",
  },
  {
    icon: Lock,
    title: "Çok Yakında",
    description: "Çok yakında hizmete girecektir",
    color: "text-gray-500",
    border: "hover:border-gray-700/50",
    glow: "group-hover:bg-gray-700/10",
    gradient: "from-gray-700/10 to-transparent",
  },
  {
    icon: Lock,
    title: "Çok Yakında",
    description: "Çok yakında hizmete girecektir",
    color: "text-gray-500",
    border: "hover:border-gray-700/50",
    glow: "group-hover:bg-gray-700/10",
    gradient: "from-gray-700/10 to-transparent",
  },
  {
    icon: Lock,
    title: "Çok Yakında",
    description: "Çok yakında hizmete girecektir",
    color: "text-gray-500",
    border: "hover:border-gray-700/50",
    glow: "group-hover:bg-gray-700/10",
    gradient: "from-gray-700/10 to-transparent",
  },
  {
    icon: Lock,
    title: "Çok Yakında",
    description: "Çok yakında hizmete girecektir",
    color: "text-gray-500",
    border: "hover:border-gray-700/50",
    glow: "group-hover:bg-gray-700/10",
    gradient: "from-gray-700/10 to-transparent",
  },
  {
    icon: Lock,
    title: "Çok Yakında",
    description: "Çok yakında hizmete girecektir",
    color: "text-gray-500",
    border: "hover:border-gray-700/50",
    glow: "group-hover:bg-gray-700/10",
    gradient: "from-gray-700/10 to-transparent",
  },
];

export default function MainHomePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const initial = email ? email[0].toUpperCase() : "U";

  const stokRolRotasi: Record<string, string> = {
    "oparator@gmail.com": "/stok/operator",
    "kidemlioparator@gmail.com": "/stok/kidemli-operator",
    "birimamiri@gmail.com": "/stok/birim-amiri",
  };

  function handleModulClick(href: string) {
    if (href === "/stok") {
      const rota = email ? stokRolRotasi[email] : undefined;
      navigate(rota ?? "/stok");
    } else {
      navigate(href);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* Arka plan dekorasyon */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-white font-bold text-base tracking-tight">NexusFlow</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-800/60 border border-gray-700/50 rounded-lg">
              <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {initial}
              </div>
              <span className="text-gray-300 text-xs max-w-[140px] truncate">{email}</span>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700 rounded-lg transition text-sm"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10 pb-8 sm:pt-14 sm:pb-10">
        <p className="text-indigo-400 text-sm font-medium mb-2">Hoş geldiniz 👋</p>
        <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">
          Bugün ne yapmak<br className="hidden sm:block" /> istersiniz?
        </h1>
        <p className="mt-3 text-gray-500 text-sm sm:text-base max-w-md">
          Aşağıdan bir modül seçerek başlayın. Her modül bağımsız çalışır ve birbirine entegre olur.
        </p>
      </section>

      {/* Modüller */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(({ icon: Icon, title, description, color, border, glow, gradient, href }) => (
            <button
              key={title}
              onClick={() => href && handleModulClick(href)}
              disabled={!href}
              className={`group relative text-left bg-gray-900 border border-gray-800 rounded-2xl p-6 ${border} transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-950 overflow-hidden disabled:cursor-not-allowed`}
            >
              {/* Arka plan parlaması */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="relative">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-800 ${glow} transition-colors duration-300 mb-5`}>
                  <Icon size={22} className={color} />
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-white font-semibold text-base mb-1.5">{title}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-700 group-hover:text-gray-400 mt-0.5 shrink-0 transition-colors duration-200 group-hover:translate-x-0.5 transform" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-gray-800/60 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <span>© 2026 NexusFlow. Tüm hakları saklıdır.</span>
          <span>v0.1.0</span>
        </div>
      </footer>

    </div>
  );
}
