'use client';

import { useEffect, useRef } from 'react';

export default function AiNetworkIllustration() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // 动态添加流动粒子
    const particles: SVGCircleElement[] = [];
    const paths = svg.querySelectorAll('.connection-line');

    paths.forEach((path, index) => {
      if (path instanceof SVGPathElement && index % 2 === 0) {
        const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        particle.setAttribute('r', '2');
        particle.setAttribute('fill', 'currentColor');
        particle.classList.add('text-primary');
        particle.style.opacity = '0.6';

        // 创建沿路径动画
        const length = path.getTotalLength();
        let progress = Math.random();
        const speed = 0.003 + Math.random() * 0.004;

        const animate = () => {
          progress += speed;
          if (progress > 1) progress = 0;

          const point = path.getPointAtLength(progress * length);
          particle.setAttribute('cx', point.x.toString());
          particle.setAttribute('cy', point.y.toString());

          requestAnimationFrame(animate);
        };

        svg.appendChild(particle);
        particles.push(particle);
        animate();
      }
    });

    return () => {
      particles.forEach(p => p.remove());
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[320px] flex items-center justify-center overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-accent/[0.03] to-primary/[0.05]" />

      {/* 浮动光晕 */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* 神经网络 SVG */}
      <svg
        ref={svgRef}
        viewBox="0 0 400 320"
        className="relative w-full h-full max-w-[400px] text-primary/80"
        fill="none"
      >
        {/* 定义渐变 */}
        <defs>
          <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.5" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 输入层节点 */}
        <g className="input-layer">
          {[60, 120, 180, 240].map((y, i) => (
            <g key={`input-${i}`}>
              <circle
                cx="60"
                cy={y}
                r="10"
                className="fill-primary/20 stroke-primary/60"
                strokeWidth="2"
              />
              <circle
                cx="60"
                cy={y}
                r="4"
                className="fill-primary"
              />
            </g>
          ))}
        </g>

        {/* 隐藏层 1 节点 */}
        <g className="hidden-layer-1">
          {[40, 100, 160, 220, 280].map((y, i) => (
            <g key={`hidden1-${i}`}>
              <circle
                cx="160"
                cy={y}
                r="10"
                className="fill-accent/20 stroke-accent/60"
                strokeWidth="2"
              />
              <circle
                cx="160"
                cy={y}
                r="4"
                className="fill-accent"
              />
            </g>
          ))}
        </g>

        {/* 隐藏层 2 节点 */}
        <g className="hidden-layer-2">
          {[60, 130, 200, 260].map((y, i) => (
            <g key={`hidden2-${i}`}>
              <circle
                cx="260"
                cy={y}
                r="10"
                className="fill-primary/20 stroke-primary/60"
                strokeWidth="2"
              />
              <circle
                cx="260"
                cy={y}
                r="4"
                className="fill-primary"
              />
            </g>
          ))}
        </g>

        {/* 输出层节点 */}
        <g className="output-layer">
          {[100, 160, 220].map((y, i) => (
            <g key={`output-${i}`}>
              <circle
                cx="340"
                cy={y}
                r="12"
                className="fill-accent/20 stroke-accent/60"
                strokeWidth="2"
                filter="url(#glow)"
              />
              <circle
                cx="340"
                cy={y}
                r="5"
                className="fill-accent"
              />
            </g>
          ))}
        </g>

        {/* 连接线条 - 输入层到隐藏层1 */}
        {[60, 120, 180, 240].map((y1, i) =>
          [40, 100, 160, 220, 280].map((y2, j) => (
            <path
              key={`conn-1-${i}-${j}`}
              d={`M 70 ${y1} Q 115 ${(y1 + y2) / 2} 150 ${y2}`}
              className="connection-line stroke-primary/25"
              strokeWidth="1"
              strokeDasharray="4 2"
            />
          ))
        )}

        {/* 连接线条 - 隐藏层1到隐藏层2 */}
        {[40, 100, 160, 220, 280].map((y1, i) =>
          [60, 130, 200, 260].map((y2, j) => (
            <path
              key={`conn-2-${i}-${j}`}
              d={`M 170 ${y1} Q 215 ${(y1 + y2) / 2} 250 ${y2}`}
              className="connection-line stroke-accent/20"
              strokeWidth="1"
            />
          ))
        )}

        {/* 连接线条 - 隐藏层2到输出层 */}
        {[60, 130, 200, 260].map((y1, i) =>
          [100, 160, 220].map((y2, j) => (
            <path
              key={`conn-3-${i}-${j}`}
              d={`M 270 ${y1} Q 305 ${(y1 + y2) / 2} 328 ${y2}`}
              className="connection-line stroke-primary/25"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          ))
        )}

        {/* 数据流动效果 - 脉冲圆环 */}
        <g className="pulse-rings">
          <circle cx="60" cy="120" r="15" className="stroke-primary/30" strokeWidth="1" fill="none">
            <animate attributeName="r" values="12;20;12" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="160" cy="160" r="15" className="stroke-accent/30" strokeWidth="1" fill="none">
            <animate attributeName="r" values="12;22;12" dur="4s" repeatCount="indefinite" begin="1s" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="4s" repeatCount="indefinite" begin="1s" />
          </circle>
          <circle cx="260" cy="130" r="15" className="stroke-primary/30" strokeWidth="1" fill="none">
            <animate attributeName="r" values="12;20;12" dur="3.5s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="3.5s" repeatCount="indefinite" begin="0.5s" />
          </circle>
          <circle cx="340" cy="160" r="18" className="stroke-accent/30" strokeWidth="1" fill="none">
            <animate attributeName="r" values="15;25;15" dur="5s" repeatCount="indefinite" begin="2s" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="5s" repeatCount="indefinite" begin="2s" />
          </circle>
        </g>

        {/* 装饰性数据点 */}
        <g className="data-points">
          <circle cx="20" cy="80" r="2" className="fill-primary/40">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="30" cy="200" r="1.5" className="fill-accent/40">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
          </circle>
          <circle cx="380" cy="60" r="2" className="fill-primary/40">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" begin="1s" />
          </circle>
          <circle cx="370" cy="280" r="1.5" className="fill-accent/40">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2.2s" repeatCount="indefinite" begin="1.5s" />
          </circle>
        </g>
      </svg>

      {/* 底部标签 */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs text-secondary/60">
        <span>输入层</span>
        <span>隐藏层</span>
        <span>输出层</span>
      </div>
    </div>
  );
}
