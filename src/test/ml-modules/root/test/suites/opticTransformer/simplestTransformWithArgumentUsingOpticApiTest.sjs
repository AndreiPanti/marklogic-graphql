"use strict";
/* global NodeBuilder, Sequence */ // For ESLint

const op = require("/MarkLogic/optic");
const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");

const simpleGraphQlWithArgumentQueryString = "query someQuery { Humans (id: \"1000\") { name height } }";
const expectedOpticPlanExport = {"$optic":{"ns":"op","fn":"operators","args":[{"ns":"op","fn":"from-view","args":[null,"Humans",null,null]},{"ns":"op","fn":"where","args":[{"ns":"op","fn":"eq","args":[{"ns":"op","fn":"viewCol","args":["Humans","id"]},"1000"]}]},{"ns":"op","fn":"select","args":[[{"ns":"op","fn":"as","args":["Humans",{"ns":"op","fn":"json-object","args":[[{"ns":"op","fn":"prop","args":["name",{"ns":"op","fn":"viewCol","args":["Humans","name"]}]},{"ns":"op","fn":"prop","args":["height",{"ns":"op","fn":"viewCol","args":["Humans","height"]}]}]]}]}],null]},{"ns":"op","fn":"group-by","args":[null,[{"ns":"op","fn":"array-aggregate","args":[{"ns":"op","fn":"col","args":["Humans"]},{"ns":"op","fn":"col","args":["Humans"]},null]}]]},{"ns":"op","fn":"select","args":[[{"ns":"op","fn":"as","args":["data",{"ns":"op","fn":"json-object","args":[[{"ns":"op","fn":"prop","args":["Humans",{"ns":"op","fn":"col","args":["Humans"]}]}]]}]}],null]}]}};
const expectedResultsRaw = op.import(expectedOpticPlanExport).result();
const nb = new NodeBuilder();
nb.addNode(Sequence.from(expectedResultsRaw).toArray()[0]);
const expectedResults = nb.toNode();
const assertions = [];

const response = transformGraphqlIntoOpticPlan(simpleGraphQlWithArgumentQueryString);
console.log("expectedOpticPlanExport:\n" + JSON.stringify(expectedOpticPlanExport));
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
// Then the result set of the Optic query is what is expected.
let actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + expectedResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(expectedResults, actualResult),
        "The resulting data set does not match the expected results.")
);

assertions;