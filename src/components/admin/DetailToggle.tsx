'use client';

import { useState } from 'react';

type Props = { detailId: string };

/** Opens a native <details> row without loading additional client data. */
export default function DetailToggle({ detailId }: Props) {
  const [opened, setOpened] = useState(false);

  function toggle() {
    const details = document.getElementById(detailId);
    if (!(details instanceof HTMLDetailsElement)) return;
    details.open = !details.open;
    setOpened(details.open);
    if (details.open) {
      details.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  return (
    <button type="button" onClick={toggle} aria-controls={detailId} aria-expanded={opened}
      className="whitespace-nowrap font-medium text-[#B5FF67] underline underline-offset-4">
      {opened ? 'Cerrar detalle ↑' : 'Ver detalle ↓'}
    </button>
  );
}
