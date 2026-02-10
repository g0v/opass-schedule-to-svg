import http from 'http'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.js': 'text/javascript; charset=utf-8',
}
const distDir = path.join(__dirname, 'dist')

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const pathname = decodeURIComponent(url.pathname)

  if (pathname === '/') {
    return sendFile(res, path.join(__dirname, 'index.html'))
  }

  // Serve development files from root
  if (pathname === '/playground.html' || pathname === '/style.config.json' || pathname.startsWith('/template/') || pathname.startsWith('/utils/')) {
    return sendFile(res, path.join(__dirname, pathname))
  }

  // Serve generated assets from dist
  const safePath = path.resolve(distDir, `.${pathname}`)
  if (!safePath.startsWith(distDir + path.sep)) {
    return send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' })
  }

  return sendFile(res, safePath)
})

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/')
})

function send(res, status, body, header = {}) {
  res.writeHead(status, header)
  res.end(body)
}

async function sendFile(res, filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME[ext] || 'application/octet-stream'

    const data = await fs.readFile(filePath)
    send(res, 200, data, { 'Content-Type': contentType })
  } catch (err) {
    if (err.code === 'ENOENT') {
      send(res, 404, 'Not Found', { 'Content-Type': 'text/plain; charset=utf-8' })
    } else {
      console.error(err)
      send(res, 500, 'Internal Server Error', { 'Content-Type': 'text/plain; charset=utf-8' })
    }
  }
}
