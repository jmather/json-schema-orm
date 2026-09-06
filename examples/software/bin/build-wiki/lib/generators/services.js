const fs = require('fs')
const path = require('path')
const _ = require('underscore')
const jsonMarkup = require('json-markup')
const css2json = require('css2json')
const styleFile = css2json(fs.readFileSync(path.resolve(path.dirname(require.resolve('json-markup')), 'style.css'), 'utf-8'))
const json2html = (json) => {
    return jsonMarkup(json, styleFile)
}

module.exports = (orm, buildRoot, templates) => {
    const services = orm.getRepository('service').getAll()

    services.forEach(service => {
        fs.writeFileSync(`${service.file_path}`, templates.service({ service, json2html }))
    })

    fs.writeFileSync(`${buildRoot}/Services.md`, templates.services({ services, json2html }))
}
