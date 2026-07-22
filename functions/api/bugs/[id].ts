import { getBug, type BugsContext } from '../_bugs';

export function onRequest(context: BugsContext): Promise<Response> {
  return getBug(context);
}
