import { useStore } from './store/useStore';
import { TopBar } from './components/TopBar';
import { FilterBar } from './components/FilterBar';
import { Navigation } from './components/Navigation';
import { Breadcrumbs } from './components/Breadcrumbs';
import { QuickActions } from './components/QuickActions';
import { PlantsView } from './components/views/PlantsView';
import { InsightsView } from './components/views/InsightsView';
import { AlertsView } from './components/views/AlertsView';
import { RankingView } from './components/views/RankingView';
import { TraceabilityTable } from './components/TraceabilityTable';
import { Drawer } from './components/Drawer';
import { Login } from './components/Login';
import { RoleDashboard } from './components/views/RoleDashboard';

function App() {
  const { activeTab, drawerOpen, user } = useStore();

  const gridTemplate = drawerOpen
    ? 'grid-cols-[240px,minmax(0,1fr),minmax(0,320px)] xl:grid-cols-[280px,minmax(0,1fr),minmax(0,360px)]'
    : 'grid-cols-[240px,minmax(0,1fr)] xl:grid-cols-[280px,minmax(0,1fr)]';

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text">
      <div
        className={`mx-auto grid min-h-screen max-w-[1920px] grid-rows-[auto,1fr] gap-6 px-6 py-6 ${gridTemplate}`}
      >
        <header className={`sticky top-6 z-50 ${drawerOpen ? 'col-span-3' : 'col-span-2'}`}>
          <TopBar />
        </header>

        <aside className="col-start-1 col-end-2 row-start-2 row-end-3">
          <Navigation />
        </aside>

        <main className="col-start-2 col-end-3 row-start-2 row-end-3 flex flex-col gap-6 pb-10">
          <QuickActions />
          <FilterBar />
          <Breadcrumbs />

          <div className="card px-6 py-6">
            {activeTab === 'dashboard' && <RoleDashboard />}
            {activeTab === 'plants' && <PlantsView />}
            {activeTab === 'insights' && <InsightsView />}
            {activeTab === 'alerts' && <AlertsView />}
            {activeTab === 'ranking' && <RankingView />}
            {activeTab === 'traceability' && (
              <div className="space-y-4">
                <div className="text-2xl font-bold text-primary-400">
                  Traceability - Vollstaendige Rueckverfolgung
                </div>
                <TraceabilityTable />
              </div>
            )}
          </div>
        </main>

        {drawerOpen && (
          <aside className="col-start-3 col-end-4 row-start-2 row-end-3">
            <Drawer />
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;

