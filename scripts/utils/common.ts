import rimraf from 'rimraf'
import net from 'net'

export function rimRaf(path: string, option: rimraf.Options = {}): Promise<Error> {
  return new Promise(resolve => {
    rimraf(path, option, resolve)
  })
}

export function portIsOccupied(port: number): Promise<number> {
  const server = net.createServer().listen(port)

  return new Promise((resolve, reject) => {
    server.on('listening', () => {
      server.close()
      resolve(port)
    })

    server.on('error', (err: Error & { code: string }) => {
      if (err.code === 'EADDRINUSE') {
        resolve(portIsOccupied(port + 1))
      } else {
        reject(err)
      }
    })
  })
}
