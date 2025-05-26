/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Define environment variables here if needed
  [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
