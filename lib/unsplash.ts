import { createApi } from "unsplash-js";
export type { Random as UnsplashImage } from "unsplash-js/dist/methods/photos/types";

export const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY!,
  fetch: fetch,
});
