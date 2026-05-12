import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { IdeaDetailPage } from './pages/IdeaDetailPage'
import { ProductShapePage } from './pages/ProductShapePage'
import { ProductPlanPage } from './pages/ProductPlanPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/idea/:id" element={<IdeaDetailPage />} />
          <Route path="/idea/:id/shape" element={<ProductShapePage />} />
          <Route path="/idea/:id/plan" element={<ProductPlanPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
