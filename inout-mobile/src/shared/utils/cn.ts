/**
 * Concatena clases ignorando falsy.
 * Sin libreria externa para mantener el bundle minimo.
 */
export function cn(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(" ");
}
