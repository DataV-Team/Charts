import { watch } from 'fs'
import { debounce } from 'lodash'
import { exec } from 'child_process'
import compiler from './utils/compiler'
import print from '@jiaminghi/print'
import { writeFile } from '@jiaminghi/fs'
import { portIsOccupied, rimRaf } from './utils/common'
import { ServerConfig } from './types/dev'

const SERVER_PORT = 5002
const SERVER_ROOT_DIR = './'
const SERVER_CONFIG_PATH = './server.json'

const DEV_FILE = [/src\/.*/, /dev\.less/, /dev\.tsx/]
const INPUT_FILE = './dev.tsx'
const OUTPUT_FILE = './dev/dev.js'
let ServerPort = SERVER_PORT

const compile = debounce(async () => {
  let success = true

  print.tip(`Compiling...`)

  await compiler(INPUT_FILE, OUTPUT_FILE).catch(({ message }) => {
    success = false
    print.error(`Compile Exception: ${message}`, true)
  })

  if (success) print.success(`Compile Successed: http://localhost:${ServerPort}`, true)
}, 500)

async function writeServeConfig(port: number): Promise<void> {
  const config: ServerConfig = {
    open: false,
    port,
    server: {
      baseDir: SERVER_ROOT_DIR,
    },
  }

  await writeFile(SERVER_CONFIG_PATH, JSON.stringify(config), { flag: 'w' })
}

;(async (): Promise<void> => {
  await rimRaf('./dev')

  ServerPort = await portIsOccupied(SERVER_PORT)

  await writeServeConfig(ServerPort)

  await compile()

  exec(`lite-server -c ${SERVER_CONFIG_PATH}`, {
    maxBuffer: 99999999,
  })
})()

watch('./', { recursive: true }, (_, filename) => {
  if (!DEV_FILE.find(_ => _.test(filename))) return

  compile()
})
