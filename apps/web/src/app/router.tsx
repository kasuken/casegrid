import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { CasePage } from '../pages/CasePage'
import { ResultPage } from '../pages/ResultPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/case/:caseId',
    element: <CasePage />,
  },
  {
    path: '/case/:caseId/result',
    element: <ResultPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
