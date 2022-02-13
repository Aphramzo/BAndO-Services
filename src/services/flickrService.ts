import axios from 'axios';
import { iFlickrApiResponse } from '../models/flickr';

export async function fetchFlickr(
  endpoint: string,
): Promise<iFlickrApiResponse | undefined> {
  try {
    console.debug('Calling', endpoint);
    const response: iFlickrApiResponse = await axios.get(endpoint);
    return response;
  } catch (e) {
    console.error('Flickr failed', e);
    throw e;
  }
}
