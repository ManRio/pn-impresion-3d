import { demoProducts } from '@/lib/demo';
import { ArrowUpRight } from 'lucide-react';
export default function ProductGrid() {
  return (
    <div className='product-grid'>
      {demoProducts.map((p, i) => (
        <article key={p.name} className='product-card'>
          <div className={`product-art product-art-${i + 1}`}>
            <span className='product-stamp'>DEMO · NO DISPONIBLE</span>
            <span
              className='product-visual'
              role='img'
              aria-label={`Representación ilustrativa: ${p.name}`}
            >
              {p.shape}
            </span>
            <span className='art-detail'>P&N / CONCEPTO 0{i + 1}</span>
          </div>
          <div className='product-info'>
            <p className='eyebrow'>{p.category}</p>
            <div className='product-title'>
              <h3>{p.name}</h3>
              <ArrowUpRight size={18} aria-hidden='true' />
            </div>
            <div className='product-bottom'>
              <span className='muted'>Ejemplo · {p.weight} g</span>
              <strong>
                Desde{' '}
                {p.from.toLocaleString('es-ES', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </strong>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
