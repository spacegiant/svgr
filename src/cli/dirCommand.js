/* eslint-disable no-underscore-dangle, no-console */
import fs from 'mz/fs'
import path from 'path'
import outputFileSync from 'output-file-sync'
import { convertFile, isCompilableExtension, readdir } from './util'

async function dirCommand(program, filenames, opts) {
  async function write(src, relative) {
    if (!isCompilableExtension(relative)) return false

    // remove extension and then append back on .js
    relative = `${relative.replace(/\.(\w*?)$/, '')}.js`

    const dest = path.join(program.outDir, relative)

    const code = await convertFile(src, opts, { filePath: dest })

    outputFileSync(dest, code)
    console.log(`${src} -> ${dest}`)

    return true
  }

  async function handle(filename) {
    if (!await fs.exists(filename)) return

    const stat = await fs.stat(filename)

    if (stat.isDirectory(filename)) {
      const dirname = filename
      const files = await readdir(dirname)
      await Promise.all(
        files.map(async _filename => {
          const relative = path.relative(dirname, _filename)
          return write(_filename, relative)
        }),
      )
    } else {
      await write(filename, filename)
    }
  }

  await Promise.all(filenames.map(handle))
}

export default dirCommand
