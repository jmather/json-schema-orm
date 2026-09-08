const fs = require('fs')
const _ = require('underscore')
const dot = require('dot')
const debug = require('debug')('WikiGenerator')
const renderDot = require(__dirname + '/../../../../../src/visualization/convert-dot').dotToPng
const glob = require('glob')

dot.templateSettings.strip = false

class ORMWikiGenerator {
    /**
     *
     * @param {ORM} orm
     * @param {string} buildRoot
     */
    generate(orm, buildRoot) {
        this.dots = this._templates()

        this._ensureDirectoryExists(buildRoot)

        const dirs = ['Repositories', 'Components', 'Networks', 'Servers', 'Domains', 'Services']
        dirs.forEach((dir) => this._ensureDirectoryExists(`${buildRoot}/${dir}`))

        glob.sync(__dirname + '/generators/**.js').forEach(file => {
            require(file)(orm, buildRoot, this.dots)
        })
    }

    _templates() {
        return this.dots || (this.dots = dot.process({ path: __dirname + "/../templates" }))
    }

    _ensureDirectoryExists(directory) {
        debug(`Checking ${directory}`)
        if (! fs.existsSync(directory)) {
            debug(`Creating ${directory}`)
            fs.mkdirSync(directory)
        }
    }
}

module.exports = ORMWikiGenerator