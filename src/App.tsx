import { useState } from 'react'
import Sidebar from './components/Sidebar'
import BookingFlowPresent from './pages/BookingFlowPresent'
import BookingFlowConfig from './pages/BookingFlowConfig'
import TemplatesGallery from './pages/TemplatesGallery'

export type Page = 'gallery' | 'present' | 'config'

export default function App() {
  const [page, setPage] = useState<Page>('gallery')
  const [_selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  function handleSelectTemplate(templateId: string) {
    setSelectedTemplate(templateId)
    setPage('present')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activePage={page} onNavigate={setPage} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {page === 'gallery' && <TemplatesGallery onSelect={handleSelectTemplate} />}
        {page === 'present' && <BookingFlowPresent onDeploy={() => setPage('config')} />}
        {page === 'config' && <BookingFlowConfig onBack={() => setPage('present')} />}
      </main>
    </div>
  )
}
