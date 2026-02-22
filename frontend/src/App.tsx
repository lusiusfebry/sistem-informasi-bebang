import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <div className="min-h-screen grid place-items-center bg-background text-foreground">
          <h1 className="text-4xl font-bold text-primary">Bebang Sistem Informasi</h1>
        </div>
      } />
    </Routes>
  )
}

export default App
