/**
 * Semantic Tailwind tokens shared UI components may reference.
 * Concrete values are owned by each app's global styles (`globals.css`).
 */
export const SEMANTIC_SURFACE_TOKENS = [
  'bg-background',
  'text-foreground',
  'bg-card',
  'text-card-foreground',
  'bg-popover',
  'text-popover-foreground',
] as const

export const SEMANTIC_ACTION_TOKENS = [
  'bg-primary',
  'text-primary-foreground',
  'bg-secondary',
  'text-secondary-foreground',
  'bg-accent',
  'text-accent-foreground',
  'bg-destructive',
  'text-destructive-foreground',
] as const

export const SEMANTIC_MUTED_TOKENS = [
  'bg-muted',
  'text-muted-foreground',
] as const

export const SEMANTIC_BORDER_TOKENS = [
  'border-border',
  'bg-input',
  'ring-ring',
] as const

/** Union of semantic token class prefixes allowed in shared component styling. */
export const SEMANTIC_TOKEN_CLASSES = [
  ...SEMANTIC_SURFACE_TOKENS,
  ...SEMANTIC_ACTION_TOKENS,
  ...SEMANTIC_MUTED_TOKENS,
  ...SEMANTIC_BORDER_TOKENS,
] as const

export type SemanticTokenClass = (typeof SEMANTIC_TOKEN_CLASSES)[number]
