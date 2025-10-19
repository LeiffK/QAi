import { useStore } from '../../store/useStore';
import { DashboardView } from './DashboardView';
import { ProductionDashboard } from './ProductionDashboard';
import { QualityDashboard } from './QualityDashboard';
import { ManagementDashboard } from './ManagementDashboard';

export const RoleDashboard = () => {
  const role = useStore((state) => state.user?.role ?? null);

  if (role === 'thomas') {
    return <ProductionDashboard />;
  }

  if (role === 'sabine') {
    return <QualityDashboard />;
  }

  if (role === 'claudia') {
    return <ManagementDashboard />;
  }

  return <DashboardView />;
};

