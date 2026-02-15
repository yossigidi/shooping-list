import { useState, useEffect } from 'react';

function ConfettiBurst({ x, y, onComplete }) {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const colors = ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f472b6', '#818cf8'];
        const newParticles = [];
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * 360;
            const velocity = 60 + Math.random() * 40;
            const size = 4 + Math.random() * 4;
            newParticles.push({
                id: i,
                color: colors[Math.floor(Math.random() * colors.length)],
                angle,
                velocity,
                size,
                x: Math.cos(angle * Math.PI / 180) * velocity,
                y: Math.sin(angle * Math.PI / 180) * velocity
            });
        }
        setParticles(newParticles);
        const timer = setTimeout(() => onComplete?.(), 600);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none', zIndex: 50 }}>
            {particles.map(p => (
                <div
                    key={p.id}
                    className="confetti-particle"
                    style={{
                        width: p.size,
                        height: p.size,
                        borderRadius: '50%',
                        backgroundColor: p.color,
                        '--tx': `${p.x}px`,
                        '--ty': `${p.y}px`,
                        animation: `particleFly 0.6s ease-out forwards`
                    }}
                />
            ))}
        </div>
    );
}

export default ConfettiBurst;
