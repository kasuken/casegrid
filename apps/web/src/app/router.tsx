import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/case/:caseId',
    lazy: async () => ({ Component: (await import('../pages/CasePage')).CasePage }),
  },
  {
    path: '/case/:caseId/result',
    lazy: async () => ({ Component: (await import('../pages/ResultPage')).ResultPage }),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
