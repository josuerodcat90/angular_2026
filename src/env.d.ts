/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly NG_TMDB_API_KEY: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
