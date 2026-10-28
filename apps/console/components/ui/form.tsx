import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from './field'
import { Input } from '@virtality/ui/components/input'
import React, { ChangeEventHandler, ReactNode } from 'react'
import { Textarea } from '@virtality/ui/components/textarea'
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@virtality/ui/components/select'
import { Checkbox } from './checkbox'
import { ignoreEmptySelectValue } from '@/lib/select-value'

type FormControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = {
  name: TName
  label: ReactNode
  description?: ReactNode
  control: ControllerProps<TFieldValues, TName, TTransformedValues>['control']
}

type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FormControlProps<TFieldValues, TName, TTransformedValues> & {
  horizontal?: boolean
  controlFirst?: boolean
  /** For fields that show their own validation state, like a password checklist. */
  hideError?: boolean
  className?: string
  children: (
    field: Parameters<
      ControllerProps<TFieldValues, TName, TTransformedValues>['render']
    >[0]['field'] & {
      'aria-invalid': boolean
      id: string
    },
  ) => ReactNode
}

type FormControlFunc<
  ExtraProps extends Record<string, unknown> = Record<never, never>,
> = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(
  props: FormControlProps<TFieldValues, TName, TTransformedValues> & ExtraProps,
) => ReactNode

type ControlledProps = 'name' | 'value' | 'defaultValue' | 'onChange' | 'id'

/** Label, control and error for one field. Use it for controls without a `Form*` helper. */
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  children,
  control,
  label,
  name,
  description,
  controlFirst,
  horizontal,
  hideError,
  className,
}: FormFieldProps<TFieldValues, TName, TTransformedValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const labelElement = (
          <>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
          </>
        )

        const control = children({
          ...field,
          id: field.name,
          'aria-invalid': fieldState.invalid,
        })

        const errorElem = !hideError && fieldState.invalid && (
          <FieldError errors={[fieldState.error]} />
        )

        return (
          <Field
            data-invalid={fieldState.invalid}
            orientation={horizontal ? 'horizontal' : undefined}
            className={className}
          >
            {controlFirst ? (
              <>
                {control}
                <FieldContent>
                  {labelElement}
                  {errorElem}
                </FieldContent>
              </>
            ) : (
              <>
                {/* flex-none: a taller grid neighbour must not push the control down */}
                <FieldContent className='flex-none'>
                  {labelElement}
                </FieldContent>
                {control}
                {errorElem}
              </>
            )}
          </Field>
        )
      }}
    />
  )
}

export const FormInput: FormControlFunc<
  Omit<React.ComponentProps<'input'>, ControlledProps | 'className'> & {
    className?: string
    inputClassName?: string
  }
> = ({
  control,
  name,
  label,
  description,
  className,
  inputClassName,
  ...inputProps
}) => {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      className={className}
    >
      {(field) => (
        <Input
          {...field}
          {...inputProps}
          value={field.value ?? ''}
          className={inputClassName}
        />
      )}
    </FormField>
  )
}

export const FormFileInput: FormControlFunc<{
  onChange?: (url: string) => void
}> = (props) => {
  return (
    <FormField {...props}>
      {(field) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { value, ...rest } = field

        const handleFileUpload: ChangeEventHandler<HTMLInputElement> = (e) => {
          if (e.target.files) {
            const file = e.target.files[0]
            field.onChange(file)
            if (props.onChange) {
              props.onChange(URL.createObjectURL(file))
            }
          }
        }
        return <Input type='file' {...rest} onChange={handleFileUpload} />
      }}
    </FormField>
  )
}

export const FormTextarea: FormControlFunc<
  Omit<React.ComponentProps<'textarea'>, ControlledProps | 'className'> & {
    className?: string
  }
> = ({ control, name, label, description, className, ...textareaProps }) => {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      className={className}
    >
      {(field) => (
        <Textarea {...field} {...textareaProps} value={field.value ?? ''} />
      )}
    </FormField>
  )
}

export const FormSelect: FormControlFunc<{
  children: ReactNode
  placeholder?: string
  className?: string
  triggerClassName?: string
  contentClassName?: string
  'data-tour'?: string
  /** Maps the stored value to an option value; `undefined` shows the placeholder. */
  toOptionValue?: (value: string | null | undefined) => string | undefined
}> = ({
  children,
  placeholder,
  triggerClassName,
  contentClassName,
  'data-tour': dataTour,
  toOptionValue,
  ...props
}) => {
  return (
    <FormField {...props}>
      {({ onChange, onBlur, value, ...field }) => (
        <Select
          name={field.name}
          disabled={field.disabled}
          value={(toOptionValue ? toOptionValue(value) : value) ?? ''}
          onValueChange={ignoreEmptySelectValue(onChange)}
        >
          <SelectTrigger
            aria-invalid={field['aria-invalid']}
            id={field.id}
            ref={field.ref}
            onBlur={onBlur}
            data-tour={dataTour}
            className={triggerClassName}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className={contentClassName}>{children}</SelectContent>
        </Select>
      )}
    </FormField>
  )
}

export const FormCheckbox: FormControlFunc<{
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}> = ({ checked, onCheckedChange, ...props }) => {
  return (
    <FormField {...props} horizontal controlFirst>
      {({ onChange, value, ...field }) => {
        const actualChecked = checked ?? value

        const handleCheckedChange = (nextChecked: boolean) => {
          onChange(nextChecked)
          onCheckedChange?.(nextChecked)
        }

        return (
          <Checkbox
            {...field}
            checked={actualChecked}
            onCheckedChange={handleCheckedChange}
          />
        )
      }}
    </FormField>
  )
}
