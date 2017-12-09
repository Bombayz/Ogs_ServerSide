var path = require('path');
var express = require('express');
var app = express();


app.use(express.static(dir));

app.listen(9898, function () {
    console.log('Listening on http://localhost:9898/');
});