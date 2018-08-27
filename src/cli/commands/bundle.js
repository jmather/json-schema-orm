const refResolver = require('json-schema-ref-parser')
const cli = require('cli')
const fs = require('fs')
const glob = require('glob')
const path = require('path')
const tools = require('../../tools')
const Ajv = require('ajv')
const ajv = new Ajv({ useDefaults: true })

//cli.parse({
//    output: [ 'o', 'Path of file to output', 'file' ],
//    force: [ 'f', 'Force overwrite', false ],
//    beautify: [ 'b', 'Format JSON beautifully', false ]
//})

cli.main((args, options) => {
    if (args.length < 1) {
        cli.error('You must specify the output path as an argument. The output file should end in .json.')
        process.exit(1)
    }

    if (args[0].split('.').splice(-1, 1)[0] !== 'json') {
        cli.error('Output file should be a JSON file.')
        process.exit(1)
    }

    options.output = path.resolve(args[0])
    options.beautify = true
    options.force = true

    const outputPath = path.resolve(options.output)
    const schemaPath = path.resolve(tools.root(options), 'schemas')

    if (fs.existsSync(outputPath) && ! options.force) {
        cli.error(`${options.output} exists, bailing... --force to force overwrite`)
        process.exit(1)
    }

    const schemaFiles = glob.sync(`${schemaPath}/**/**.yaml`)
    const schemaPromises = schemaFiles.map(schemaFile => {
        return refResolver.bundle(schemaFile).then(schema => {
            const schemaName = path.basename(schemaFile, '.schema.yaml')
            return {
                name: schemaName,
                schemaFile: schemaFile.replace(`${schemaPath}/`, ''),
                schema
            }
        })
    })

    refResolver.dereference(path.resolve(__dirname, '../../meta-schemas/json-schema-orm.schema.yaml')).then(metaSchema => {
        Promise.all(schemaPromises).then(schemaRefs => {
            const schema = {
                oneOf: [],
                definitions: {
                    schemas: {}
                }
            }

            schemaRefs.forEach(schemaRef => {
                ajv.validate(metaSchema, schemaRef.schema)
                schema.definitions.schemas[schemaRef.name] = {
                    path: schemaRef.schemaFile,
                    schema: schemaRef.schema
                }
                schema.oneOf.push({ $ref: `#/definitions/schemas/${schemaRef.name}/schema` })
            })

            const content = options.beautify ? tools.prettyJSON(schema) : JSON.stringify(schema)
            fs.writeFileSync(outputPath, content)

            cli.ok(`Wrote ${outputPath}...`)
        })
    })
})
