/* */ 
var _ = require('lodash');
var fs = require('fs');
var filesize = require('filesize');
var tachyons = require('./package.json!systemjs-json');
var srcDir = fs.readdirSync('./src/');
var filesCount = srcDir.length - 3;
var postcss = require('postcss');
var cssstats = require('cssstats');
var css = fs.readFileSync('./css/tachyons.min.css', 'utf8');
var ast = postcss.parse(css);
var obj = cssstats(ast);
var astObj = JSON.stringify(ast, null, '\t');
var stats = JSON.stringify(obj, null, '\t');
var size = filesize(obj.gzipSize);
var template = fs.readFileSync('./templates/index.html', 'utf8');
var tpl = _.template(template);
var html = tpl({
  size: size,
  version: tachyons.version,
  modulesCount: filesCount
});
fs.writeFileSync('./index.html', html);
