'use client';

type PostCardIllustrationProps = {
  tag: string;
  title: string;
};

export default function PostCardIllustration({ tag, title }: PostCardIllustrationProps) {
  // 根据标签选择不同的图案类型
  const patternType = getPatternType(tag);

  // 生成基于标题的伪随机种子
  const seed = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-primary/[0.03] to-accent/[0.06]" />

      {/* SVG 图案 */}
      <svg
        viewBox="0 0 200 140"
        className="absolute inset-0 w-full h-full"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={`grad-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.7" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
          </linearGradient>
          <filter id={`glow-${seed}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 根据类型渲染不同图案 */}
        {patternType === 'neural' && <NeuralPattern seed={seed} />}
        {patternType === 'code' && <CodePattern seed={seed} />}
        {patternType === 'data' && <DataPattern seed={seed} />}
        {patternType === 'abstract' && <AbstractPattern seed={seed} />}
      </svg>

      {/* 悬停时的光效 */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5" />
    </div>
  );
}

// 根据标签判断图案类型
function getPatternType(tag: string): 'neural' | 'code' | 'data' | 'abstract' {
  const neuralTags = ['AI', '机器学习', '深度学习', '神经网络', '模型', 'GPT', 'AI工具'];
  const codeTags = ['编程', '开发', '代码', 'Cursor', 'Vibe Coding', '工具', '教程'];
  const dataTags = ['数据', '分析', '可视化', '统计', 'Python'];

  if (neuralTags.some(t => tag.toLowerCase().includes(t.toLowerCase()))) return 'neural';
  if (codeTags.some(t => tag.toLowerCase().includes(t.toLowerCase()))) return 'code';
  if (dataTags.some(t => tag.toLowerCase().includes(t.toLowerCase()))) return 'data';
  return 'abstract';
}

// 神经网络图案
function NeuralPattern({ seed }: { seed: number }) {
  const rand = (n: number) => ((seed * 9301 + 49297) % 233280) / 233280 * n;

  return (
    <g className="text-primary">
      {/* 节点 */}
      {[20, 60, 100, 140].map((y, i) =>
        [30, 90, 150].map((x, j) => {
          const offset = rand(10) - 5;
          return (
            <circle
              key={`node-${i}-${j}`}
              cx={x}
              cy={y + offset}
              r={3 + rand(3)}
              fill="currentColor"
              fillOpacity={0.4 + rand(0.4)}
            />
          );
        })
      )}

      {/* 连接线 */}
      {[20, 60, 100, 140].map((y1, i) =>
        [20, 60, 100, 140].map((y2, j) => {
          if (i === j) return null;
          const opacity = rand(0.3);
          if (opacity < 0.15) return null;
          return (
            <path
              key={`conn-${i}-${j}`}
              d={`M 30 ${y1} Q 60 ${(y1 + y2) / 2} 90 ${y2}`}
              stroke="currentColor"
              strokeOpacity={opacity}
              strokeWidth="0.5"
              fill="none"
            />
          );
        })
      )}

      {/* 脉冲点 */}
      <circle cx="90" cy="80" r="4" fill="currentColor" fillOpacity="0.6">
        <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
        <animate attributeName="fillOpacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

// 代码风格图案
function CodePattern({ seed }: { seed: number }) {
  const rand = (n: number) => ((seed * 9301 + 49297) % 233280) / 233280 * n;

  return (
    <g className="text-accent">
      {/* 代码行 */}
      {Array.from({ length: 6 }).map((_, i) => {
        const y = 25 + i * 18;
        const width = 60 + rand(80);
        const indent = rand(30);
        return (
          <g key={`code-${i}`}>
            <rect
              x={20 + indent}
              y={y - 3}
              width={width}
              height={6}
              rx="3"
              fill="currentColor"
              fillOpacity={0.15 + rand(0.2)}
            />
            {/* 高亮部分 */}
            {rand(1) > 0.6 && (
              <rect
                x={20 + indent + width + 5}
                y={y - 3}
                width={15 + rand(20)}
                height={6}
                rx="3"
                fill="currentColor"
                fillOpacity={0.4}
              />
            )}
          </g>
        );
      })}

      {/* 光标 */}
      <rect x="35" y="115" width="2" height="12" fill="currentColor" fillOpacity="0.8">
        <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
      </rect>

      {/* 括号装饰 */}
      <text x="170" y="35" fill="currentColor" fillOpacity="0.2" fontSize="24" fontFamily="monospace">{'{}'}</text>
      <text x="175" y="120" fill="currentColor" fillOpacity="0.15" fontSize="20" fontFamily="monospace">{'</>'}</text>
    </g>
  );
}

// 数据流图案
function DataPattern({ seed }: { seed: number }) {
  const rand = (n: number) => ((seed * 9301 + 49297) % 233280) / 233280 * n;

  return (
    <g className="text-primary">
      {/* 柱状图 */}
      {Array.from({ length: 7 }).map((_, i) => {
        const height = 30 + rand(70);
        const x = 25 + i * 24;
        return (
          <rect
            key={`bar-${i}`}
            x={x}
            y={110 - height}
            width="16"
            height={height}
            rx="2"
            fill="currentColor"
            fillOpacity={0.1 + rand(0.25)}
          />
        );
      })}

      {/* 趋势线 */}
      <path
        d={`M 25 ${90 - rand(40)} L 73 ${80 - rand(40)} L 121 ${70 - rand(40)} L 169 ${60 - rand(40)}`}
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* 数据点 */}
      {[33, 73, 121, 169].map((x, i) => (
        <circle
          key={`point-${i}`}
          cx={x}
          cy={80 - rand(40)}
          r="4"
          fill="currentColor"
          fillOpacity="0.6"
        />
      ))}

      {/* 装饰圆圈 */}
      <circle cx="170" cy="40" r="15" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" fill="none" />
      <circle cx="175" cy="35" r="8" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" fill="none" />
    </g>
  );
}

// 抽象几何图案
function AbstractPattern({ seed }: { seed: number }) {
  const rand = (n: number) => ((seed * 9301 + 49297) % 233280) / 233280 * n;

  return (
    <g className="text-accent">
      {/* 同心圆 */}
      {[60, 45, 30, 15].map((r, i) => (
        <circle
          key={`circle-${i}`}
          cx="100"
          cy="70"
          r={r}
          stroke="currentColor"
          strokeOpacity={0.05 + (4 - i) * 0.03}
          strokeWidth="1"
          fill="none"
        />
      ))}

      {/* 连接线 */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const r = 60;
        const x2 = 100 + Math.cos(angle) * r;
        const y2 = 70 + Math.sin(angle) * r;
        return (
          <line
            key={`line-${i}`}
            x1="100"
            y1="70"
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="1"
          />
        );
      })}

      {/* 外围点 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const r = 50 + rand(15);
        const x = 100 + Math.cos(angle) * r;
        const y = 70 + Math.sin(angle) * r;
        return (
          <circle
            key={`dot-${i}`}
            cx={x}
            cy={y}
            r={2 + rand(3)}
            fill="currentColor"
            fillOpacity={0.2 + rand(0.3)}
          />
        );
      })}

      {/* 中心发光点 */}
      <circle cx="100" cy="70" r="6" fill="currentColor" fillOpacity="0.5" filter={`url(#glow-${seed})`}>
        <animate attributeName="fillOpacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}
