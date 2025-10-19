import { useStore } from '../../store/useStore';
import { CAUSE_MAP } from '../../data/mockData';

export const CauseMap = () => {
  const { setFilter } = useStore();

  const { nodes, edges } = CAUSE_MAP;

  // SVG dimensions
  const width = 800;
  const height = 500;

  // Position nodes in a network layout
  const nodePositions: Record<string, { x: number; y: number }> = {
    summer: { x: 100, y: 100 },
    night: { x: 100, y: 250 },
    supplierX: { x: 100, y: 400 },
    highOutput: { x: 300, y: 50 },
    deformation: { x: 400, y: 150 },
    nutQuality: { x: 400, y: 350 },
    defectRate: { x: 650, y: 250 },
  };

  const handleNodeClick = (nodeId: string) => {
    // Map nodes to filter actions
    if (nodeId === 'supplierX') {
      setFilter('supplierId', 'S4');
    } else if (nodeId === 'night') {
      setFilter('shift', 'Nacht');
    }
  };

  return (
    <div className="card p-5" id="cause-map">
      <h3 className="text-lg font-semibold mb-4">Ursache-Wirkungs-Netzwerk (KI)</h3>

      <div className="h-[500px] flex items-center justify-center">
        <svg width={width} height={height} className="mx-auto">
          {/* Edges */}
          {edges.map((edge, idx) => {
            const source = nodePositions[edge.source];
            const target = nodePositions[edge.target];

            if (!source || !target) return null;

            const strokeWidth = edge.strength * 3;
            const strokeColor = edge.confidence === 3 ? '#489cd0' : edge.confidence === 2 ? '#64bad9' : '#8ccce4';

            return (
              <g key={idx}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  opacity={0.6}
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          })}

          {/* Arrow marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#489cd0" />
            </marker>
          </defs>

          {/* Nodes */}
          {nodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const isCause = node.type === 'cause';
            const fillColor = isCause ? '#3a81af' : '#ef4444';

            return (
              <g
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={40}
                  fill={fillColor}
                  opacity={0.8}
                  className="hover:opacity-100 transition-opacity"
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#e5e7eb"
                  fontSize="12"
                  fontWeight="500"
                  className="pointer-events-none"
                >
                  {node.label.split(' ').map((word, i) => (
                    <tspan key={i} x={pos.x} dy={i === 0 ? 0 : 14}>
                      {word}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Insights */}
      <div className="mt-6 space-y-3">
        {edges.slice(0, 3).map((edge, idx) => (
          <div key={idx} className="bg-dark-bg rounded-lg p-3 border border-dark-border">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium text-dark-text">
                {nodes.find((n) => n.id === edge.source)?.label} â†’ {nodes.find((n) => n.id === edge.target)?.label}
              </div>
              <div className="text-xs text-yellow-400">
                {'â˜…'.repeat(edge.confidence)}
              </div>
            </div>
            <div className="text-sm text-dark-muted">{edge.explanation}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-dark-muted">
        ðŸ’¡ <strong>Tipp:</strong> Klicken Sie auf Knoten, um Filter zu setzen und Details zu sehen.
      </div>
    </div>
  );
};

