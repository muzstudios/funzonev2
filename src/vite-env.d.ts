/// <reference types="vite/client" />

declare module '3dmol' {
  export const rasmolElementColors: any;
  export function createViewer(element: HTMLElement | string, config?: any): any;
}
