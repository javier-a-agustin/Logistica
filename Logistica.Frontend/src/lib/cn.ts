// Une clases de Tailwind ignorando los valores falsy
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
