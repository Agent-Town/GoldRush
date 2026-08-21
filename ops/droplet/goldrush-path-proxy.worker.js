// goldrush-path-proxy — serves the game under agenttown.app/goldrush/ from the LIVE
// production Pages alias (E1-only builds; owner ruling 2026-08-21: production tracks
// gold-rush-3in.pages.dev, never a frozen branch deployment again).
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/goldrush") {
      url.pathname = "/goldrush/";
      return Response.redirect(url.toString(), 301);
    }
    const upstreamPath = url.pathname.replace(/^\/goldrush\//, "/");
    const upstream = "https://gold-rush-3in.pages.dev" + upstreamPath + url.search;
    return fetch(upstream, request);
  }
};
