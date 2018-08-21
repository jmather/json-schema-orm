const path = require('path')
const yaml = require('js-yaml')
const fs = require('fs')
const glob = require('glob')

const tools = {
    root: (options) => {
        if (options && options.project) {
            return path.resolve(process.cwd(), options.project)
        }

        if (typeof options === 'string') {
            return path.resolve(__dirname, options)
        }

        return path.resolve(__dirname + '/../')
    },
    loadYAML: (filePath) => {
        return yaml.safeLoad(fs.readFileSync(filePath))
    },
    loadJSON: (filePath) => {
        return JSON.parse(fs.readFileSync(filePath))
    },
    prettyJSON: (object) => {
        return JSON.stringify(object, null, 2)
    },
    ensureDir: (dir) => {
        if (! fs.existsSync(dir)) {
            fs.mkdirSync(dir)
        }
    },
    jsonifySchemas: (sourcePath, destinationPath) => {
        const files = glob.sync(sourcePath + '/**.yaml')
        tools.ensureDir(destinationPath)

        files.forEach(file => {
            const destFile = path.resolve(destinationPath, path.basename(file).replace('.yaml', '.json'))
            const content = tools.prettyJSON(tools.loadYAML(file))
            const rewriteContent = content.replace(/(.*)\$ref(.*)\.yaml(.*)/g, '$1$ref$2.json$3')
            fs.writeFileSync(destFile, rewriteContent)
        })
    }
}

module.exports = tools