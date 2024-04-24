import { createProxyMiddleware } from 'http-proxy-middleware';

export default createProxyMiddleware({
  target: 'https://y4hkyw2fs9.execute-api.us-east-1.amazonaws.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/saw': '/dev/api/saw',
  },
});
