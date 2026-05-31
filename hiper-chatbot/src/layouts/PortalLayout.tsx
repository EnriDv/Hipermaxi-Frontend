import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export const PortalLayout = () => {
  return (
    <div className="portal-layout">
      <Sidebar />
      <div className="portal-workspace">
        <Outlet />
      </div>
    </div>
  );
};
