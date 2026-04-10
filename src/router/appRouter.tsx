import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import VisualizerPage from '@/pages/VisualizerPage'

export function createAppRouter(basename: string) {
  return createBrowserRouter(
    [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <VisualizerPage /> },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
    { basename },
  )
}
