import React, { useMemo } from 'react'
import { RouterProvider } from 'react-router-dom'
import { createAppRouter } from '@/router/appRouter'

function App() {
  const basename = document.querySelector('base')
    ? new URL(document.baseURI).pathname.replace(/\/$/, '') || '/'
    : '/'
  const router = useMemo(() => createAppRouter(basename), [basename])

  return <RouterProvider router={router} />
}

export default App
