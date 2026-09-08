const fs = require('fs')
const _ = require('underscore')
const tools = require('../tools')

module.exports = (orm, buildRoot, templates) => {
    const domains = _.sortBy(orm.getRepository('domain').getAll(), domain => `${domain.name.split('.').length} ${domain.name}`)

    _.forEach(domains, domain => {
        fs.writeFileSync(`${domain.file_path}`, templates.domain(domain))
    })

    fs.writeFileSync(`${buildRoot}/Domains.md`, templates.domains({ domains }))
}