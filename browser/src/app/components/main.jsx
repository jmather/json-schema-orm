const React = require('react');
const Bootstrap = require('react-bootstrap')

const Navigation = require('./navigation.jsx')
const SideNavigation = require('./side-nav.jsx')
const Repository = require('./repository.jsx')

class Main extends React.Component {
    constructor(props) {
        super(props)

        this.state = { repository: null }
    }

    setRepository(name) {
        this.setState({ repository: name })
    }
    
    render() {
        let display = (
            <div>
                <h1>Pick a class to view</h1>
            </div>
        )

        if (this.state.repository) {
            display = (
                <Repository repository={this.props.orm.getRepository(this.state.repository)} />
            )
        }

        return (
            <div>

                <Navigation projectName="Schema Browser" setRepository={(name) => this.setRepository(name)} orm={this.props.orm}/>

                <div className="container">
                    <br />
                    <Bootstrap.Grid>
                        <Bootstrap.Col xs={6} md={4}>
                            <SideNavigation setRepository={(name) => this.setRepository(name)} orm={this.props.orm}/>
                        </Bootstrap.Col>
                        <Bootstrap.Col xsOffset={6} mdOffset={4}>
                            {display}
                        </Bootstrap.Col>
                    </Bootstrap.Grid>
                </div>
            </div>
        );
    }
}

module.exports = Main;