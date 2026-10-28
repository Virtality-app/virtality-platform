import { Label } from '@virtality/ui/components/label'
import { Textarea } from '@virtality/ui/components/textarea'

type TranslationFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  missing: string[]
  hint?: string
}

export function TranslationField({
  id,
  label,
  value,
  onChange,
  missing,
  hint,
}: TranslationFieldProps) {
  return (
    <div className='space-y-1.5'>
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={missing.length > 0}
      />
      {hint && <p className='text-muted-foreground text-xs'>{hint}</p>}
      {missing.length > 0 && (
        <p role='alert' className='text-destructive text-xs'>
          Missing {missing.map((name) => `{{${name}}}`).join(', ')}
        </p>
      )}
    </div>
  )
}
