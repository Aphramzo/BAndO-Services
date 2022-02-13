export interface iImage {
  date: string;
  description?: string | undefined;
  largeWidth: number;
  largeHeight: number;
  smallWidth: number;
  smallHeight: number;
  tags: string[];
  urlLarge: string;
  urlOriginal: string;
  urlSmall: string;
  video: boolean;
  videoUrl?: string | null;
}

export interface iFlickrDescription {
  _content: string;
}

export interface iFlickrPhoto {
  datetaken: string;
  description: iFlickrDescription;
  width_l: number;
  width_n?: number | null;
  height_l: number;
  height_n?: number | null;
  tags: string;
  url_l: string;
  url_o: string;
  url_n?: string | null;
  url_m?: string | null;
  media: string;
  id: string;
  secret: string;
}

export interface iFlickrPhotos {
  photo: Array<iFlickrPhoto>;
  page: number;
  pages: number;
  perpage: number;
  total: string;
}

export interface iFlickrApiResponse {
  photos: iFlickrPhotos;
  stat: string;
}
