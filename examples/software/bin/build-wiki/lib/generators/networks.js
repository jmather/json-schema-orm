const fs = require('fs')
const _ = require('underscore')
const tools = require('../tools')

module.exports = (orm, buildRoot, templates) => {
    const interfaces = orm.getRepository('network_interface').getAll()

    const networks = {}

    _.forEach(interfaces, inet => {
        if (! networks[inet.network_name]) {
            networks[inet.network_name] = [inet]
        } else {
            networks[inet.network_name].push(inet)
        }
    })

    const networkObjs = _.map(networks, (interfaces, name) => {
        const network = {
            name,
            interfaces,
            file_path: '/Networks/' + tools.sanitizeFileName(name) + '.md'
        }

        fs.writeFileSync(`${buildRoot}/${network.file_path}`, templates.network(network))

        return network
    })

    fs.writeFileSync(`${buildRoot}/Networks.md`, templates.networks({ networks: networkObjs }))
}