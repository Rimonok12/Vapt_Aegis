/**
 * yak theme context.
 *
 * Resolved on the server for React Server Components and provided to client
 * components through `YakThemeProvider` in the root layout. Keeping this tiny:
 * colour/spacing tokens live in CSS custom properties (see `src/styles/globals.ts`)
 * so the stylesheet stays 100% static and zero-runtime.
 */
export function getYakThemeContext() {
  return {
    productName: 'Aegis',
  };
}

declare module '@yak/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- module augmentation must use an interface
  export interface YakTheme extends ReturnType<typeof getYakThemeContext> {}
}
