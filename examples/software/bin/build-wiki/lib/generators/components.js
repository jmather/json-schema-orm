const fs = require('fs')
const path = require('path')
const _ = require('underscore')
const debug = require('debug')('components');
const renderDot = require(__dirname + '/../../../../../../src/visualization/convert-dot').dotToPng
const jsonMarkup = require('json-markup')
const css2json = require('css2json')
const styleFile = css2json(fs.readFileSync(path.resolve(path.dirname(require.resolve('json-markup')), 'style.css'), 'utf-8'))
const json2html = (json) => {
    return jsonMarkup(json, styleFile).replace(/^\]/m, '    ]');
}

const slugify = (str) => {
    return str.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
}

const getConfigSetProps = (config_set) => {
    const propNames = {};
    const keys = Object.keys(config_set);
    for (let i = 0; i < keys.length; i++) {
        Object.keys(config_set[keys[i]]).forEach(k => propNames[k] = true);
    }
    return Object.keys(propNames);
}

const getEnvConfigSets = (envs) => {
    const props = [];
    envs.forEach(env => {
        if (env.config_sets) {
            // console.log(env);
            Object.keys(env.config_sets).forEach(key => {
                props.push(key);
            })
        }
    });
    return _.uniq(props);
}

module.exports = (orm, buildRoot, templates) => {
    buildComponents(orm, buildRoot, templates)
    buildComponentHome(orm, buildRoot, templates)
}

const buildComponents = (orm, buildRoot, templates) => {
    const components = orm.getRepository('component').getAll()

    components.forEach(component => {
        debug('Component', { name: component.name, type: component.type });
        // console.log({ component , dependencies: getDependencies(component), json2html, getConfigSetProps, getEnvConfigSets, slugify })
        const content = templates[`component_${component.type}`]({ component , dependencies: getDependencies(component), json2html, getConfigSetProps, getEnvConfigSets, slugify })
        fs.writeFileSync(`${component.file_path}`, content)
    })
}

const buildComponentHome = (orm, buildRoot, templates) => {
    const components = orm.getRepository('component').getAll()
    const componentDependencies = orm.getRepository('component_dependency').getAll()
    console.log(componentDependencies)

    generateComponentImage(components, buildRoot)

    const aggregateComponents = _.filter(components, (component) => component.parent_components.length > 0)

    const subComponentNames = _.uniq(_.flatten(aggregateComponents.map((component) => {
        return getDependencies(component).map((c) => c.component.name)
    })))

    const topLevelComponents = _.filter(aggregateComponents, (component) => subComponentNames.indexOf(component.name) === -1)
    const topLevelComponentDependencies = {}
    topLevelComponents.forEach((c) => topLevelComponentDependencies[c.name] = getDependencies(c).map(cc => cc.component))

    const componentTypes = {}

    components.forEach((component) => {
        if (! componentTypes[component.type]) {
            componentTypes[component.type] = []
        }

        componentTypes[component.type].push(component)
    })

    const typePriorities = ['application', 'library', 'tool', 'resources', 'unknown']

    const templateData = {
        typePriorities,
        componentTypes,
        topLevelComponents,
        topLevelComponentDependencies,
        json2html,
        getEnvConfigSets,
        slugify
    }

    const content = templates.components(templateData)
    fs.writeFileSync(`${buildRoot}/Components.md`, content)
}


const generateComponentImage = (components, buildRoot) => {
    const trees = generateComponentTrees(components)

    console.log(trees)
    const services = getComponentServices(components)

    const componentName = (component) => component.name.replace(/ /g, '_')
    const componentCollection = []

    const pairs = {};

    let diGraph = 'digraph {\nrankdir=LR;\n'
    trees.forEach(tree => {
        tree.forEach(component => {
            let label = component.name;
            if (component.repository) {
                label += "\n" + component.repository.name;
            }
            diGraph = diGraph + `${componentName(component)} [label="${label}", shape=box3d];\n`
            componentCollection.push(component)
        })


        tree.forEach(component => {
            component.parent_components.forEach(pc => {
                const pairKey = componentName(component) + componentName(pc);
                if (pairs[pairKey]) {
                    return;
                }
                diGraph = diGraph + `${componentName(component)} -> ${componentName(pc)};\n`
                pairs[pairKey] = true;
            })
        })
    })

    services.forEach(service => {
        diGraph = diGraph + `${componentName(service)} [label="${service.name}", shape=component, style=filled, color=lightgray];\n`
    })

    const uniqueComponents = _.uniq(componentCollection, false, (c) => c.name)

    uniqueComponents.forEach(component => {
        component.required_services.forEach(service => {
            diGraph = diGraph + `${componentName(component)} -> ${componentName(service)};\n`
        })
    })


    diGraph = diGraph + '}\n'

    renderDot(diGraph).then(png => {
        fs.writeFileSync(`${buildRoot}/components.dot`, diGraph)
        fs.writeFileSync(`${buildRoot}/components.png`, png)
    })
}

const getComponentServices = (components) => {
    const services = _.flatten(components.map((component) => {
        return component.required_services
    }))

    return _.uniq(services, false, (s) => s.name)
}

const generateComponentTrees = (components) => {
    const componentTrees = []

    const getCurrentTree = (componentName) => {
        for (let i = 0; i < componentTrees.length; i++) {
            if (componentTrees[i].indexOf(componentName) > -1) {
                return componentTrees[i]
            }
        }

        const newTree = [componentName]
        componentTrees.push(newTree)
        return newTree
    }

    _.forEach(components, c => {
        const tree = getCurrentTree(c.name)
        c.parent_components.forEach(pc => tree.push(pc.name))
        c.child_components.forEach(cc => tree.push(cc.name))
    })

    return componentTrees.map(tree => {
        return _.uniq(tree).map(name => {
            return _.find(components, c => c.name === name)
        })
    })
}


const getDependencies = (component, level = 0) => {
    let ret = []

    if (level > 0) {
        ret.push({ component, level })
    }

    ret = ret.concat(_.flatten(component.parent_components.map(pc => getDependencies(pc, level + 1))))

    return ret
}
