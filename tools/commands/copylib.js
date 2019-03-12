var EgretProject = require("../project");
var Copylib = (function () {
    function Copylib() {
    }
    Copylib.prototype.execute = function () {
		EgretProject.manager.copyToLibs();
		return 0;
	}
	return Copylib;
})()
module.exports = Copylib;