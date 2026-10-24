import { useCallback, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import ProjectFormModal from '../components/projects/ProjectFormModal';

export default function AppLayout() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const openCreate = useCallback(() => setCreating(true), []);

  return (
    <div className="min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} onNewProject={openCreate} />
      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setMobileOpen(true)} onNewProject={openCreate} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet context={{ openCreateProject: openCreate }} />
        </main>
      </div>
      <ProjectFormModal
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={(project) => {
          setCreating(false);
          navigate(`/app/projects/${project.id}`);
        }}
      />
    </div>
  );
}
