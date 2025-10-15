import { useStore } from './store/useStore';
import { TopBar } from './components/TopBar';
import { FilterBar } from './components/FilterBar';
import { Navigation } from './components/Navigation';
import { Breadcrumbs } from './components/Breadcrumbs';
import { QuickActions } from './components/QuickActions';
import { DashboardView } from './components/views/DashboardView';
import { PlantsView } from './components/views/PlantsView';
import { InsightsView } from './components/views/InsightsView';
import { AlertsView } from './components/views/AlertsView';
import { RankingView } from './components/views/RankingView';
import { TraceabilityTable } from './components/TraceabilityTable';
import { Drawer } from './components/Drawer';

function App() {
  const { activeTab } = useStore();

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-[1920px] mx-auto p-6">
        {/* Top Bar */}
        <TopBar />

        {/* Filter Bar */}
        <FilterBar />

        {/* Quick Actions */}
        <QuickActions />

        {/* Tab Navigation */}
        <Navigation />

        {/* Breadcrumbs */}
        <Breadcrumbs />

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'plants' && <PlantsView />}
          {activeTab === 'insights' && <InsightsView />}
          {activeTab === 'alerts' && <AlertsView />}
          {activeTab === 'ranking' && <RankingView />}
          {activeTab === 'traceability' && (
            <div className="space-y-4">
              <div className="text-2xl font-bold text-primary-400">
                Traceability – Vollständige Rückverfolgung
              </div>
              <TraceabilityTable />
            </div>
          )}
        </div>
      </div>

      {/* Drawer (Overlay) */}
      <Drawer />
    </div>
  );
}

export default App;
