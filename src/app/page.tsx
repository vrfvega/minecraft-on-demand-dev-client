import AdminPanel from "@/components/AdminPanel"

export default function Home() {
    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200">
            <header className="border-b border-neutral-800 bg-neutral-900">
                <div className="max-w-7xl mx-auto py-8 px-4">
                    <h1 className="text-3xl font-medium text-center">
                        Server Admin Panel
                    </h1>
                </div>
            </header>
            <main className="container max-w-2xl mx-auto py-12 px-4">
                <AdminPanel />
            </main>
        </div>
    )
}