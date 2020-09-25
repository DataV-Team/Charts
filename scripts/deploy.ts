import { fileForEach } from '@jiaminghi/fs'
import print from '@jiaminghi/print'
import { emptyDir, put, mkDir } from '@jiaminghi/ftp'
import { getCmdParams } from '@jiaminghi/utils-node'
import Client from 'ftp'

const DIST_PATH = './docs/.vuepress/dist'

type Config = {
  host: string
  user: string
  pass: string
}

let config: Config | null = null

try {
  config = require('./config')
} catch (e) {
  config = null
}

const ftp = new Client()

ftp.on('ready', async _ => {
  let error = false
  const handleException = (tip: string) => ({ message }: { message: string }): void => {
    error = true
    print.error(tip)
    print.error(message)
  }

  print.tip('FTP connected!')

  await emptyDir(ftp, '/').catch(handleException('Exception in emptyDir!'))

  await fileForEach(DIST_PATH, async src => {
    if (error) return
    const destPath = '/' + src.split('dist/')[1]
    const destDir = destPath.split('/').slice(0, -1).join('/')

    print.tip('Upload: ' + destPath)

    await mkDir(ftp, destDir, true).catch(handleException('Exception in mkDir!'))
    if (error) return

    await put(ftp, src, destPath).catch(handleException('Exception in put!'))
  })

  if (error) {
    print.error('Deploy Failed!')
  } else {
    print.yellow('-------------------------------------')
    print.success('    Automatic Deployment Success!    ')
    print.yellow('-------------------------------------')
  }

  ftp.destroy()
})

ftp.on('greeting', _ => {
  print.tip('FTP greeting')
})
ftp.on('close', _ => {
  print.tip('FTP close')
})
ftp.on('end', _ => {
  print.tip('FTP end')
})
ftp.on('error', _ => {
  print.tip('FTP error')
})

function deploy(): void {
  const { host, user, pass } = config || getCmdParams()

  if (!host || !user || !pass) {
    return print.error('Upload Dist to FTP Missing Parameters!')
  }

  print.tip('Start Upload!')

  ftp.connect({
    host,
    user,
    password: pass,
  })
}

deploy()
