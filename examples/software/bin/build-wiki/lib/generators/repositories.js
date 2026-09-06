const fs = require('fs')
const _ = require('underscore')

module.exports = (orm, buildRoot, templates) => {
    const repositories = orm.getRepository('repository').getAll()
    const components = orm.getRepository('component').getAll()

    // console.log({repositories, components})
    const componentRepos = _.uniq(components.map((c) => c.repository_name))

    _.forEach(repositories, repo => {
        fs.writeFileSync(`${repo.file_path}`, templates.repository(repo))
    })

    const reposWithComponents = _.filter(repositories, (r) => componentRepos.indexOf(r.name) > -1)
    const reposWithoutComponents = _.filter(repositories, (r) => reposWithComponents.indexOf(r) === -1)

    const repoSets = {
        bound: reposWithComponents,
        unbound: reposWithoutComponents,
    }

    const content = templates.repositories(repoSets)
    fs.writeFileSync(`${buildRoot}/Repositories.md`, content)
}