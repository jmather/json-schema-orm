const fs = require('fs')
const _ = require('underscore')
const tools = require('../tools')

module.exports = (orm, buildRoot, templates) => {
    const servers = orm.getRepository('server').getAll()

    _.forEach(servers, server => {
        fs.writeFileSync(`${server.file_path}`, templates.server(server))
    })

    fs.writeFileSync(`${buildRoot}/Servers.md`, templates.servers({ servers }))
}