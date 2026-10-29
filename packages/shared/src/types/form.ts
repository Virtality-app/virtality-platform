type FieldValues = {
  [x: string]: any
}

export type FieldMeta<T extends FieldValues> = {
  [K in Extract<keyof T, string>]: {
    label: string
    placeholder?: string
    description?: string
    hint?: string
  }
}
