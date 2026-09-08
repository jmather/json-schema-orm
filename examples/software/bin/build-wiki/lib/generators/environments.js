const fs = require('fs')
const _ = require('underscore')

module.exports = (orm, buildRoot, templates) => {
    const environments = orm.getRepository('environment').getAll()
    const components = orm.getRepository('component').getAll()

    const sortedEnvs = _.sortBy(environments, (e) => e.priority)
    const definedEnvs = _.map(environments, (e) => e.name.toLowerCase())
    const componentEnvs = _.uniq(_.flatten(_.map(components, (c) => {
        return _.map(c.environments, (ce) => ce.environment_name)
    })))
    const undefinedEnvs = _.filter(componentEnvs, (ceName) => definedEnvs.indexOf(ceName.toLowerCase()) === -1)
    const allEnvs = componentEnvs.concat(undefinedEnvs)
    const componentsInEnv = {}

    _.each(allEnvs, (env) => {
        const ComponentEnvObjs = _.map(components, (c) => {

            const envDefs = _.filter(c.environments, (ce) => ce.environment_name.toLowerCase() === env.toLowerCase())

            if (envDefs.length > 1) {
                throw new Error(`Component ${c.name} has multiple URLs defined for ${env} Environment`)
            }

            if (envDefs.length === 0) {
                return null
            }

            if (envDefs[0].url === undefined) {
                return null
            }

            return {
                name: c.name,
                url: envDefs[0].url,
                component: c,
            }
        })

        componentsInEnv[env] = _.sortBy(_.filter(ComponentEnvObjs, (ceo) => ceo !== null), (ceo) => ceo.name)
    })

    const sortedEnvNames = _.map(sortedEnvs, (e) => e.name).concat(undefinedEnvs)

    const envsByEnv = {}
    _.each(environments, (e) => {
        envsByEnv[e.name] = e
    })

    const templateData = {
        environments: sortedEnvNames,
        componentsByEnv: componentsInEnv,
        environmentsByEnv: envsByEnv,
    }

    const content = templates.environments(templateData)
    fs.writeFileSync(`${buildRoot}/Environments.md`, content)
}