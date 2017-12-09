var app = require('express')();
// var app = express(); var express = require('express')();

var serveStatic = require('serve-static')
var finalhandler = require('finalhandler')

var multer = require('multer')
var path = require('path')
var crypto = require('crypto')
var users = require('./users');
var config = require('./configDb');
var cors = require('cors');

var bodyParser = require('body-parser');

var mysql = require('mysql');

var con = mysql.createConnection({host: '203.154.82.62', user: 'user', password: '!Ogs1234', database: 'survery'});

var port = process.env.PORT || 80;

var dir = path.join(__dirname, 'public');
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(app.static('public'))

app.use(cors({origin: '*'}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// default options app.use(fileUpload()); Add headers
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var storage = multer.diskStorage({
    destination: './public/uploadsimg',
    filename: function (req, file, cb) {
        crypto
            .pseudoRandomBytes(16, function (err, raw) {
                if (err) 
                    return cb(err)

                cb(null, "IMG_" + Date.now() + "_" + raw.toString('hex') + path.extname(file.originalname))
            })
    },
    rename: function (fieldname, filename) {
        return "IMG_" + Date.now();
    }
})

var upload = multer({storage: storage});

var upload2 = multer();

app.get('/', function (req, res) {
    res.send('<h1>Welcom API OGS.co.th</h1>');
});

app.get('/user', function (req, res) {
    res.json(users.findAll());
});

app.use(serveStatic('./public/uploadsimg', {'index': ['default.html', 'default.htm']}))

app.post('/chklogin', function (req, res) {

    var json = req.body

    console.log(">>" + json.user)
    console.log(">>" + json.password)

    try {
        if (req.body) {

            var qry = "SELECT * FROM survery.authentication WHERE survery.authentication.username = '" + json.user + "' AND survery.authentication.password = '" + json.password + "'"
            console.log(">>" + qry)

            con.query({
                sql: qry
            }, function (error, results, fields) {

                var chk = results[0]
                console.log("re = " + JSON.stringify(chk))

                if (typeof chk != "undefined") {
                    res.json({status: "ok", user_id: results[0]['id'], name: results[0]['firstname']
                    });
                } else {
                    res.json({status: "deny"});
                }

                console.log(error)
            });

        } else {
            res.json({status: "deny"});
        }
    } catch (error) {
        res.json({status: "deny"});
    }

});

app.post('/sendFormData', function (req, res) {
    var json = req.body;
    console.log(json.lat)
    console.log(json.lon)
    console.log(json.moo)
    console.log(json.addr_no)

    try {
        if (req.body) {
            var qry = "INSERT INTO survery.Addr( moo , addr_no , lat , lon , doc_id , date_in ,byuser )" +
                    " VALUES ( " + + " " + json.moo + "  , '" + json.addr_no + "' , '" + json.lat + "' , '" + json.lon + "' , '" + json.doc_id + "' , CURDATE(),'" + json.user_id + "')"
            console.log(">>" + qry)

            con.query({
                sql: qry
            }, function (error, results, fields) {
                console.log(error)
            });

            res.json({status: "ok"});
        } else {
            res.json({status: "deny"});
        }
    } catch (error) {
        res.json({status: "deny"});
    }

});

app.post('/saveImg', function (req, res) {
    var json = req.body;
    console.log("doc_id >>" + json.doc_id);

    try {
        if (req.body) {

            for (f = 0; f < json.file.length; f++) {

                var qry = "INSERT INTO survery.Addr_Img ( filename , doc_id ) VALUES( '" + json.file[f] + "' , " + json.doc_id + " );"
                console.log(qry)
                con.query({
                    sql: qry
                }, function (error, results, fields) {
                    console.log(error)
                });

            }

            res.json({status: "ok"});

        } else {
            res.json({status: "deny"});
        }
    } catch (error) {
        res.json({status: "deny"});
    }

});

app.post('/upload', function (req, res, next) {
    upload.array('userPhoto', 10)(req, res, function (err) {
        var file = req.files

        arrPhoto = []
        for (f = 0; f < req.files.length; f++) {
            console.log(file[f]['filename'])
            arrPhoto.push(file[f]['filename'])
        }

        if (err) {
            return res.end("Error uploading file.");
        }

        res.json({"status": "ok", "file": arrPhoto});
    });

});

app.get('/user/:id', function (req, res) {
    var id = req.params.id;
    res.json(users.findById(id));
});

app.get('/getData/:id', function (req, res) {
    var id = req.params.id
    resp = {}
    data = []

    qry = "SELECT * FROM survery.Addr WHERE byuser = '" + id + "'"

    console.log(qry)

    con.query({
        sql: qry
    }, function (error, results, fields) {
        console.log(error)
        for (i = 0; i < results.length; i++) {
            data.push(results[i])
        }
        resp.data = data
        resp.status = "ok"
        res.json(resp);
    });

});

app.get('/getData/', function (req, res) {
    resp = {}
    data = []

    qry = "SELECT * FROM survery.Addr"

    console.log(qry)

    con.query({
        sql: qry
    }, function (error, results, fields) {
        console.log(error)
        for (i = 0; i < results.length; i++) {
            data.push(results[i])
        }
        resp.data = data
        resp.status = "ok"
        res.json(resp);
    });
});

app.get('/getImg/:id', function (req, res) {
    var id = req.params.id
    resp = {}
    data = []

    qry = "SELECT * FROM survery.Addr_Img WHERE doc_id = '" + id + "'"

    console.log(qry)

    con.query({
        sql: qry
    }, function (error, results, fields) {
        console.log(error)
        for (i = 0; i < results.length; i++) {
            data.push(results[i])
        }
        resp.data = data
        resp.status = "ok"
        res.json(resp);
    });
});

app.get('/getImg/', function (req, res) {
    resp = {}
    data = []

    qry = "SELECT * FROM survery.Addr_Img"

    console.log(qry)

    con.query({
        sql: qry
    }, function (error, results, fields) {
        console.log(error)
        for (i = 0; i < results.length; i++) {
            data.push(results[i])
        }
        resp.data = data
        resp.status = "ok"
        res.json(resp);
    });
});

app.post('/newuser', function (req, res) {
    var json = req.body;
});

app.listen(port, function () {
    console.log('Starting node.js on port ' + port);
});