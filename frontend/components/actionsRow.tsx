'use client';

import { ActionButton } from './buttons/actionButton';

type ActionsRowProps = {
  onKeep?: () => void
  onRollup?: () => void
  onTrash?: () => void
  onUnsubscribe?: () => void
}

export function ActionsRow({ onKeep, onRollup, onTrash, onUnsubscribe }: ActionsRowProps) {
  const actions: Array<'keep' | 'rollup' | 'trash' | 'unsubscribe'> = [
    'keep',
    'rollup',
    'trash',
    'unsubscribe'
  ];

  return (
    <div className="actionsRow">
      {actions.map((action) => (
        <ActionButton
          key={action}
          type={action}
          onClick={() => {
            if (action === 'keep') onKeep?.()
            if (action === 'rollup') onRollup?.()
            if (action === 'trash') onTrash?.()
            if (action === 'unsubscribe') onUnsubscribe?.()
          }}
        />
      ))}
    </div>
  );
}
