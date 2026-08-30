/*
 * probe for mediaMTX input. Requires hlsAllowOrigins in mediamtx.yml to permit this origin, else fetch blocked by CORS.
 */
(function (w) {
  w.ZigStream = {
    isLive: async function (url) {
      try {
        const r = await fetch(url, { method: 'GET', cache: 'no-store' });
        return r.ok;
      } catch {
        return false;
      }
    }
  };
})(window);
