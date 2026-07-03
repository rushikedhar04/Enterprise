export function NeuralIllustration() {
  const nodes = [
    [40, 60], [40, 130], [40, 200],
    [140, 40], [140, 110], [140, 180], [140, 250],
    [240, 80], [240, 160], [240, 230],
    [340, 130],
  ];
  const edges = [
    [0, 3], [0, 4], [1, 4], [1, 5], [2, 5], [2, 6],
    [3, 7], [4, 7], [4, 8], [5, 8], [5, 9], [6, 9],
    [7, 10], [8, 10], [9, 10],
  ];
  return (
    <svg viewBox="0 0 380 290" className="h-44 w-auto" fill="none">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]} y1={nodes[a][1]}
          x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="var(--color-primary)"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
      ))}
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="9" fill="var(--color-primary)" fillOpacity="0.15" />
          <circle cx={x} cy={y} r="4" fill="var(--color-primary)">
            <animate attributeName="r" values="3.5;5;3.5" dur="2.4s" begin={`${i * 0.18}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </svg>
  );
}