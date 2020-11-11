const harvester = require('Role_Harvester');
const upgrader = require('Role_Upgrader');
const builder = require('Role_Builder');
const mover = require('Role_Mover');

module.exports = {
    Harvester: harvester,
    Upgrader: upgrader,
    Builder: builder,
    Mover: mover
}