import { useState } from 'react'
import Sidebar from './components/Sidebar'
import BookingFlowPresent from './pages/BookingFlowPresent'
import BookingFlowConfig from './pages/BookingFlowConfig'

export type Page = 'present' | 'config'

export default function App() {
  const [page, setPage] = useState<Page>('present')

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activePage={page} onNavigate={setPage} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {page === 'present' && <BookingFlowPresent onDeploy={() => setPage('config')} />}
        {page === 'config' && <BookingFlowConfig onBack={() => setPage('present')} />}
      </main>
    </div>
  )
}
