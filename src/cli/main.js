const cli = require('cli')

class CliMain {
  constructor() {
    cli.enable('version')
    cli.setApp(__dirname + '/../../package.json')
  }
  run() {
    cli.parse(
      {
        project: ['p', 'Path to project root', 'dir'],
      },
      [
        'validate'
      ]
    )

    if (cli.command) {
      require(__dirname + '/commands/' + cli.command)
    }

    cli.main((args, options) => {
      if (! options.project) {
        cli.error('You must define a project root! Use --help for details.')
        cli.exit(1)
      }

    })
  }
}

module.exports = CliMain
