var Griddle = require('./views/other-fake-griddle');
var React = require('react');
var FakeData = require('./fake/fake-data');

React.render(<Griddle data={FakeData}/>, document.getElementById('main'));
