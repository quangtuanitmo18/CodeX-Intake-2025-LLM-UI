"use client"

import { cn } from "@/lib/utils"
import { createContext, useContext } from "react"
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, UseFormReturn } from "react-hook-form"

type FormProps<TFieldValues extends FieldValues = FieldValues> = {
  children: React.ReactNode
} & UseFormReturn<TFieldValues>

export function Form<TFieldValues extends FieldValues>({ children, ...form }: FormProps<TFieldValues>) {
  return <FormProvider {...form}>{children}</FormProvider>
}

type FormFieldContextValue = {
  error?: string
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null)

export const useFormField = () => {
  const context = useContext(FormFieldContext)
  if (!context) throw new Error("useFormField must be used inside FormField")
  return context
}

export function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
  props: ControllerProps<TFieldValues, TName>
) {
  return (
    <Controller
      {...props}
      render={({ field, fieldState, formState }) => (
        <FormFieldContext.Provider value={{ error: fieldState.error?.message }}>
          {props.render({ field, fieldState, formState })}
        </FormFieldContext.Provider>
      )}
    />
  )
}

export function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />
}

export function FormMessage({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { error } = useFormField()
  if (!error) return null
  return (
    <p className={cn("text-sm text-red-400", className)} {...props}>
      {error}
    </p>
  )
}


