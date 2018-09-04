(function () {

    const React = require('react')
    const ReactDOM = require('react-dom')
    const Main = require('./components/main.jsx')
    const schemas = require('../../project/bundle/schemas')
    const JS_ORM = require('../../../src/orm/index')
    const _ = require('underscore')

    const schemaCollection = new JS_ORM.SchemaCollection(schemas.definitions.schemas)

    const orm = new JS_ORM.ORM(schemaCollection)

    //Needed for React Developer Tools
    window.React = React;

    // Render the main app react component into the document body.https://facebook.github.io/react/blog/2015/10/01/react-render-and-top-level-api.html
    ReactDOM.render(<Main orm={orm} />, document.getElementById("react-target"));

})();