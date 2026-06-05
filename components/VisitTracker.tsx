'use client';

import { useEffect } from 'react';

export default function VisitTracker({ propiedadId }: { propiedadId: string }) {
  useEffect(() => {
    fetch('/api/visitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propiedadId }),
    }).catch(() => {});
  }, [propiedadId]);

  return null;
}
