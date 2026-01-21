import { useStore } from '@tanstack/react-form'
import { Button, TextInput, Textarea, Select, Slider, Switch } from '@mantine/core'

import { useFieldContext, useFormContext } from '@/hooks/demo.form-context'

export function SubscribeButton({ label }: { label: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" disabled={isSubmitting}>
          {label}
        </Button>
      )}
    </form.Subscribe>
  )
}

function ErrorMessages({
  errors,
}: {
  errors: Array<string | { message: string }>
}) {
  return (
    <>
      {errors.map((error) => (
        <div
          key={typeof error === 'string' ? error : error.message}
          className="text-red-500 mt-1 font-bold"
        >
          {typeof error === 'string' ? error : error.message}
        </div>
      ))}
    </>
  )
}

export function TextField({
  label,
  placeholder,
}: {
  label: string
  placeholder?: string
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <TextInput
        label={label}
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        error={field.state.meta.isTouched && errors.length > 0 ? errors[0] : undefined}
        styles={{
          label: {
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
          },
        }}
      />
    </div>
  )
}

export function TextArea({
  label,
  rows = 3,
}: {
  label: string
  rows?: number
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <Textarea
        label={label}
        value={field.state.value}
        onBlur={field.handleBlur}
        rows={rows}
        onChange={(e) => field.handleChange(e.target.value)}
        error={field.state.meta.isTouched && errors.length > 0 ? errors[0] : undefined}
        styles={{
          label: {
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
          },
        }}
      />
    </div>
  )
}

export function SelectField({
  label,
  values,
  placeholder,
}: {
  label: string
  values: Array<{ label: string; value: string }>
  placeholder?: string
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <Select
        label={label}
        value={field.state.value}
        onChange={(value) => field.handleChange(value || '')}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        data={values}
        error={field.state.meta.isTouched && errors.length > 0 ? errors[0] : undefined}
        styles={{
          label: {
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
          },
        }}
      />
    </div>
  )
}

export function SliderField({ label }: { label: string }) {
  const field = useFieldContext<number>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <Slider
        label={label}
        value={field.state.value}
        onChange={(value) => field.handleChange(value)}
        onBlur={field.handleBlur}
        min={0}
        max={100}
        styles={{
          label: {
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
          },
        }}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function SwitchField({ label }: { label: string }) {
  const field = useFieldContext<boolean>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <Switch
        label={label}
        checked={field.state.value}
        onChange={(e) => field.handleChange(e.currentTarget.checked)}
        onBlur={field.handleBlur}
        styles={{
          label: {
            fontSize: '1rem',
            fontWeight: 500,
          },
        }}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
