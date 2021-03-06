var LineByLineReader = require('line-by-line');
var elasticSearch = require('elasticsearch')

var hostAddress = process.argv[2];
var filePath = process.argv[3];

var client = new elasticSearch.Client({
    host: hostAddress,
    minSockets: 200,
    maxSockets: 500
});

var lr = new LineByLineReader(filePath);

var i = 0;
var previous = null;

lr.on('line', function (line) {

    var variables = line.split('\t');
    var t1 = variables[0];
    var t2 = variables[1];
    var v = parseInt(variables[2]);

    client.index({
        index: "technologies",
        type: "relations",
        id: t1 + "_" + t2,
        body: {
            t1: t1,
            t2: t2,
            v: v
        }
    }).then(function (body, res) {
            console.log("" + i + " - " + line.toString());
            i++;
        }
    );

    if (previous !== t1) {
        previous = t1;

        client.index({
            index: "technologies",
            type: "list",
            id: t1,
            body: {
                name: t1
            }
        })
    }

});



