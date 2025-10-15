import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { BATCHES, PLANTS, LINES, PRODUCTS, SUPPLIERS } from '../data/mockData';
import { filterBatches } from '../utils/filterData';

export const TraceabilityTable = () => {
  const { filters, brushSelection, openDrawer } = useStore();

  const tableData = useMemo(() => {
    const filtered = filterBatches(BATCHES, filters, brushSelection);

    return filtered.slice(0, 50).map((batch) => {
      const plant = PLANTS.find((p) => p.id === batch.plantId);
      const line = LINES.find((l) => l.id === batch.lineId);
      const product = PRODUCTS.find((p) => p.id === batch.productId);
      const supplier = SUPPLIERS.find((s) => s.id === batch.supplierId);

      return {
        ...batch,
        plantName: plant?.name || batch.plantId,
        lineName: line?.name || batch.lineId,
        productName: product?.name || batch.productId,
        supplierName: supplier?.name || batch.supplierId,
      };
    });
  }, [filters, brushSelection]);

  const handleBatchClick = (batch: any) => {
    openDrawer('batch', batch);
  };

  return (
    <div className="card p-5" id="traceability">
      <h3 className="text-lg font-semibold mb-4">Traceability – Werk → Linie → Charge</h3>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="text-left py-3 px-2 font-medium text-dark-muted">Charge</th>
              <th className="text-left py-3 px-2 font-medium text-dark-muted">Werk</th>
              <th className="text-left py-3 px-2 font-medium text-dark-muted">Linie</th>
              <th className="text-left py-3 px-2 font-medium text-dark-muted">Produkt</th>
              <th className="text-left py-3 px-2 font-medium text-dark-muted">Lieferant</th>
              <th className="text-left py-3 px-2 font-medium text-dark-muted">Lot</th>
              <th className="text-left py-3 px-2 font-medium text-dark-muted">Schicht</th>
              <th className="text-right py-3 px-2 font-medium text-dark-muted">Fehlerrate</th>
              <th className="text-right py-3 px-2 font-medium text-dark-muted">FPY</th>
              <th className="text-right py-3 px-2 font-medium text-dark-muted">Ausschuss</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((batch) => (
              <tr
                key={batch.id}
                className="border-b border-dark-border/50 hover:bg-dark-border/30 transition-colors cursor-pointer"
                onClick={() => handleBatchClick(batch)}
              >
                <td className="py-2 px-2 text-primary-400 font-medium">{batch.id}</td>
                <td className="py-2 px-2">{batch.plantName}</td>
                <td className="py-2 px-2">{batch.lineName}</td>
                <td className="py-2 px-2">{batch.productName}</td>
                <td className="py-2 px-2">{batch.supplierName}</td>
                <td className="py-2 px-2 text-dark-muted">{batch.lotNumber}</td>
                <td className="py-2 px-2">
                  <span className="badge badge-info">{batch.shift}</span>
                </td>
                <td className="py-2 px-2 text-right">
                  <span
                    className={`font-medium ${
                      batch.defectRate > 5 ? 'text-red-400' : batch.defectRate > 3 ? 'text-yellow-400' : 'text-green-400'
                    }`}
                  >
                    {batch.defectRate.toFixed(2)}%
                  </span>
                </td>
                <td className="py-2 px-2 text-right">{batch.fpy.toFixed(1)}%</td>
                <td className="py-2 px-2 text-right">{batch.scrapRate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        {tableData.length === 0 && (
          <div className="text-center py-12 text-dark-muted">
            <div className="text-4xl mb-2">📊</div>
            <div>Keine Daten für die gewählten Filter gefunden.</div>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-dark-muted">
        Zeige {tableData.length} von {BATCHES.length} Chargen. Klicken für Details.
      </div>
    </div>
  );
};
