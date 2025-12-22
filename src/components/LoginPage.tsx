import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()

  return (
    <div className="h-screen w-screen bg-zinc-950 flex flex-col items-center justify-center gap-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950" />
        
        <div className="z-10 text-center space-y-4">
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic">
                RPG<span className="text-indigo-500">Master</span>
            </h1>
            <p className="text-zinc-400">Faça login para acessar suas fichas</p>
            
            <button 
                onClick={login}
                className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-indigo-500 hover:text-white transition-all shadow-2xl hover:scale-105"
            >
                Entrar com Google
            </button>
        </div>
    </div>
  )
}