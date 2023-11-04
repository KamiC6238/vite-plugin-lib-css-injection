import fs from 'node:fs'
import path from 'node:path'
import type { PluginOption, ResolvedConfig } from 'vite'

interface FileBundle {
  fileName: string;
  code: string;
}

interface Output {
  dir?: string
}

function checkESM(format?: string) {
  return format === 'es' || format === 'esm'
}

function generateCSSInjectionCode(files: string[], entryFileName: string) {
  const res: string[] = []
  const tmp = entryFileName.split('/')
  const relativePaths = tmp.slice(0, tmp.length - 1)
  const relativePath = relativePaths.length === 0
    ? './'
    : relativePaths.reduce((res, _) => {
      res += '../'
      return res
    }, '')

  for (const file of files) {
    if (file.endsWith('.css')) {
      res.push(`import "${relativePath}${file}"`)
    }
  }

  return res.join('\n')
}

function injectCSS(rootPath: string, fileBundle: FileBundle, output?: Output) {
  const dirname = path.resolve(rootPath, output?.dir ?? 'dist')
  const filesOfDir = fs.readdirSync(dirname)
  const cssInjectionCode = generateCSSInjectionCode(filesOfDir, fileBundle.fileName)
  const entryFilePath = `${dirname}/${fileBundle.fileName}`
  const injectedCode = `${cssInjectionCode}\n${fileBundle.code}`

  fs.writeFileSync(entryFilePath, injectedCode, 'utf-8')
}

export default function vitePluginLibCSSInjection(): PluginOption {
  let resolvedConfig: ResolvedConfig | null = null

  return {
    name: 'vite-plugin-libcss-injection',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      resolvedConfig = config
    },
    writeBundle(options, bundle) {
      if (!resolvedConfig?.build.lib) return
      if (!checkESM(options.format)) return

      const files = Object.keys(bundle)

      for (const file of files) {
        const fileBundle = bundle[file]

        if ('isEntry' in fileBundle && fileBundle.isEntry) {
          const { rollupOptions } = resolvedConfig!.build

          if (rollupOptions.output) {
            if (Array.isArray(rollupOptions.output)) {
              for (const output of rollupOptions.output) {
                if (checkESM(output.format)) {
                  injectCSS(resolvedConfig.root, fileBundle, output)
                }
              }
            } else {
              injectCSS(resolvedConfig.root, fileBundle, rollupOptions.output)
            }
          } else {
            injectCSS(resolvedConfig.root, fileBundle)
          }
        }
      }
    },
  }
}