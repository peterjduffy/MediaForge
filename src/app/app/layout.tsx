import AppNav from '@/components/navigation/AppNav'
// import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Temporarily disabled for testing - uncomment to re-enable auth
    // <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppNav />
        <main className="flex-1">
          {children}
        </main>
      </div>
    // </ProtectedRoute>
  )
}