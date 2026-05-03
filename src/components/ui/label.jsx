import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from './utils';

/**
 * Label — componente base shadcn/ui para labels de formulário.
 * Uso: <Label htmlFor="email">Email</Label>
 *
 * Gerencia automaticamente estados disabled quando emparelhado com inputs Radix.
 */
function Label({ className, ...props }) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none',
        'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Label };
