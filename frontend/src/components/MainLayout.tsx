import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function MainLayout() {
  const [menuOuvert, setMenuOuvert] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar onOuvrirMenu={() => setMenuOuvert(true)} />
      <div className="flex flex-1">
        <Sidebar ouvert={menuOuvert} onFermer={() => setMenuOuvert(false)} />
        {}
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet /> {}
        </main>
      </div>
    </div>
  )
}