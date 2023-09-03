const PROXY_FETCH_REGEX = /^\/proxy\/fetch\/host=(.+?)\//;

function readHostName(path) {
  try {
    const result = PROXY_FETCH_REGEX.exec(path);
    const host = decodeURIComponent(result[1]);
    if (host !== undefined && host.length >= 1) {
      return host;
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
}

module.exports = function (
  app,
  createProxyMiddleware,
  host = "http://localhost:8000"
) {
  app.use(
    /^\/proxy\/fetch/,
    createProxyMiddleware(
      (path, req) => {
        if (PROXY_FETCH_REGEX.test(path) && readHostName(path) !== undefined) {
          return true;
        }
        return false;
      },
      {
        router: (req) => readHostName(req.path) ?? host,
        pathRewrite: (path, req) => {
          return path.replace(PROXY_FETCH_REGEX, "/");
        },
        changeOrigin: true,
      }
    )
  );
};
