import { useStore } from '../../store/useStore';
import { PlantsOverview } from './PlantsOverview';
import { LinesDetail } from './LinesDetail';

export const PlantsView = () => {
  const { selectedPlantId } = useStore();

  return (
    <div>
      {selectedPlantId ? <LinesDetail /> : <PlantsOverview />}
    </div>
  );
};
