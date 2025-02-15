import AdminPanel from "@/components/AdminPanel"

export default function Home() {
  return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-foreground">Minecraft Server Admin Panel</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <AdminPanel />
          </div>
        </main>
      </div>
  )
}
