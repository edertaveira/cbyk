"use strict";

var IndexModel = require("../models/index");

module.exports = function (router) {
    var model = new IndexModel();

    function mountMatrix(rows, cols) {
        var matrix = [];
        for (var indexr = 0; indexr < rows; indexr++) {
            for (var indexc = 0; indexc < cols; indexc++) {
                if (!matrix[indexr]) matrix[indexr] = [];
                matrix[indexr][indexc] = "-";
            }
        }
        return matrix;
    }

    function getRandomPosition(matrix) {
        if (matrix.length === 0) return;
        var row = Math.floor(Math.random() * (matrix.length - 1));
        var col = Math.floor(Math.random() * (matrix[0].length - 1));
        return { row, col };
    }

    function runOneDay(matrix) {
        return [...matrix].map((itemr, index) => {
            itemr = itemr.map((itemc, indexc) => {
                if (
                    (matrix[index][indexc - 1] &&
                        matrix[index][indexc - 1] === "*") ||
                    (matrix[index][indexc + 1] &&
                        matrix[index][indexc + 1] === "*") ||
                    (matrix[index - 1] &&
                        matrix[index - 1][indexc] &&
                        matrix[index - 1][indexc] === "*") ||
                    (matrix[index + 1] &&
                        matrix[index + 1][indexc] &&
                        matrix[index + 1][indexc] === "*")
                )
                    itemc = "*";
                return itemc;
            });
            return itemr;
        });
    }

    router.post("/calc", function (req, res) {
        const rows = req.body.areay || 10;
        const cols = req.body.areax || 10;
        const clouds = req.body.clouds || 4;
        const airport = req.body.airport || 3;

        let matrix = mountMatrix(rows, cols);

        for (let index = 0; index < clouds; index++) {
            const { row, col } = getRandomPosition(matrix);
            matrix[row][col] = "*";
        }

        for (let index = 0; index < airport; index++) {
            var { row, col } = getRandomPosition(matrix);
            matrix[row][col] = "A";
        }

        const airports = matrix.filter((item) => {
            const c = item.filter((itemc) => itemc === "A");
            return c.length > 0;
        });

        let haveAirport = true;
        let day = 0;
        let result = [];
        result.push({ day, matrix });
        while (haveAirport) {

            matrix = runOneDay(matrix);
            const matWithAirport = matrix.filter((item) => {
                const c = item.filter((itemc) => itemc === "A");
                return c.length > 0;
            });
            haveAirport = matWithAirport.length > 0;

            day++;
            result.push({ day, matrix, airports: matWithAirport.length });
        }
        res.json({ rows: result, airports: airports.length, clouds });
    });
};
