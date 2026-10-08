import { useEffect, useState } from 'react';

type LineClearEffectProps = {
  rowIndex: number;
  cellSize: number;
  boardWidth: number;
};

const LineClearEffect = ({ rowIndex, cellSize, boardWidth }: LineClearEffectProps) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    angle: number;
    speed: number;
  }>>([]);

  useEffect(() => {
    // Создаем частицы для эффекта
    const colors = ['#00f0f0', '#f0f000', '#a000f0', '#00f000', '#f00000', '#f0a000'];
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * boardWidth * cellSize,
      y: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * 360,
      speed: Math.random() * 100 + 50,
    }));
    setParticles(newParticles);
  }, [boardWidth, cellSize]);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: rowIndex * cellSize,
        left: 0,
        width: boardWidth * cellSize,
        height: cellSize,
        zIndex: 10,
      }}
    >
      {/* Вспышка */}
      <div
        className="absolute inset-0 animate-flash"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
          animation: 'flash 0.4s ease-out',
        }}
      />

      {/* Частицы */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-particle"
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            boxShadow: `0 0 10px ${particle.color}`,
            animation: `particle-${particle.id} 0.6s ease-out forwards`,
          }}
        />
      ))}

      {/* CSS анимации для частиц */}
      <style>{`
        @keyframes flash {
          0% {
            opacity: 1;
            transform: scaleX(0);
          }
          50% {
            opacity: 1;
            transform: scaleX(1);
          }
          100% {
            opacity: 0;
            transform: scaleX(1);
          }
        }

        ${particles.map((p) => `
          @keyframes particle-${p.id} {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(
                ${Math.cos(p.angle * Math.PI / 180) * p.speed}px,
                ${Math.sin(p.angle * Math.PI / 180) * p.speed}px
              ) scale(0);
              opacity: 0;
            }
          }
        `).join('')}
      `}</style>
    </div>
  );
};

export default LineClearEffect;
