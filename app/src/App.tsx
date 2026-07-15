import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import OverviewPage from './pages/OverviewPage';
import ArchitecturePage from './pages/ArchitecturePage';
import SourcesPage from './pages/SourcesPage';
import PocCriteriaPage from './pages/PocCriteriaPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<OverviewPage />} />
        <Route path="architecture" element={<ArchitecturePage />} />
        <Route path="sources" element={<SourcesPage />} />
        <Route path="poc-criteria" element={<PocCriteriaPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
