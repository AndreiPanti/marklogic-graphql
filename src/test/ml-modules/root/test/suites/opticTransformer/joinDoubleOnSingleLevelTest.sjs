'use strict';

const op = require('/MarkLogic/optic');
const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require('/mlGraphqlLibOpticApi');
const {deepEqual} = require('/testHelpers');

const simpleGraphQlJoinQueryString = `query humansCarsJoin { Humans { id name height Cars { ownerId model year } Laptops { ownerId model screenSize } } }`;
const expectedOpticPlanExport = {"$optic":{"ns":"op","fn":"operators","args":[{"ns":"op","fn":"from-view","args":[null,"Humans","Humans",null]},{"ns":"op","fn":"select","args":[[{"ns":"op","fn":"col","args":["id"]},{"ns":"op","fn":"col","args":["name"]},{"ns":"op","fn":"col","args":["height"]}],null]},{"ns":"op","fn":"join-left-outer","args":[{"ns":"op","fn":"operators","args":[{"ns":"op","fn":"from-view","args":[null,"Cars",null,null]},{"ns":"op","fn":"select","args":[[{"ns":"op","fn":"viewCol","args":["Cars","ownerId"]},{"ns":"op","fn":"as","args":["Cars",{"ns":"op","fn":"json-object","args":[[{"ns":"op","fn":"prop","args":["ownerId",{"ns":"op","fn":"col","args":["ownerId"]}]},{"ns":"op","fn":"prop","args":["model",{"ns":"op","fn":"col","args":["model"]}]},{"ns":"op","fn":"prop","args":["year",{"ns":"op","fn":"col","args":["year"]}]}]]}]}],null]}]},[{"ns":"op","fn":"on","args":[{"ns":"op","fn":"viewCol","args":["Humans","id"]},{"ns":"op","fn":"viewCol","args":["Cars","ownerId"]}]}],null]},{"ns":"op","fn":"group-by","args":[[{"ns":"op","fn":"viewCol","args":["Humans","id"]}],[{"ns":"op","fn":"viewCol","args":["Humans","name"]},{"ns":"op","fn":"viewCol","args":["Humans","height"]},{"ns":"op","fn":"array-aggregate","args":[{"ns":"op","fn":"col","args":["Cars"]},{"ns":"op","fn":"col","args":["Cars"]},null]}]]},{"ns":"op","fn":"join-left-outer","args":[{"ns":"op","fn":"operators","args":[{"ns":"op","fn":"from-view","args":[null,"Humans","primaryViewAlias1",null]},{"ns":"op","fn":"select","args":[[{"ns":"op","fn":"col","args":["id"]},{"ns":"op","fn":"col","args":["name"]},{"ns":"op","fn":"col","args":["height"]}],null]},{"ns":"op","fn":"join-left-outer","args":[{"ns":"op","fn":"operators","args":[{"ns":"op","fn":"from-view","args":[null,"Laptops",null,null]},{"ns":"op","fn":"select","args":[[{"ns":"op","fn":"viewCol","args":["Laptops","ownerId"]},{"ns":"op","fn":"as","args":["Laptops",{"ns":"op","fn":"json-object","args":[[{"ns":"op","fn":"prop","args":["ownerId",{"ns":"op","fn":"col","args":["ownerId"]}]},{"ns":"op","fn":"prop","args":["model",{"ns":"op","fn":"col","args":["model"]}]},{"ns":"op","fn":"prop","args":["screenSize",{"ns":"op","fn":"col","args":["screenSize"]}]}]]}]}],null]}]},[{"ns":"op","fn":"on","args":[{"ns":"op","fn":"viewCol","args":["primaryViewAlias1","id"]},{"ns":"op","fn":"viewCol","args":["Laptops","ownerId"]}]}],null]},{"ns":"op","fn":"group-by","args":[[{"ns":"op","fn":"viewCol","args":["primaryViewAlias1","id"]}],[{"ns":"op","fn":"viewCol","args":["primaryViewAlias1","name"]},{"ns":"op","fn":"viewCol","args":["primaryViewAlias1","height"]},{"ns":"op","fn":"array-aggregate","args":[{"ns":"op","fn":"col","args":["Laptops"]},{"ns":"op","fn":"col","args":["Laptops"]},null]}]]}]},[{"ns":"op","fn":"on","args":[{"ns":"op","fn":"viewCol","args":["primaryViewAlias1","id"]},{"ns":"op","fn":"viewCol","args":["Humans","id"]}]}],null]},{"ns":"op","fn":"select","args":[[{"ns":"op","fn":"as","args":["Humans",{"ns":"op","fn":"json-object","args":[[{"ns":"op","fn":"prop","args":["id",{"ns":"op","fn":"viewCol","args":["Humans","id"]}]},{"ns":"op","fn":"prop","args":["name",{"ns":"op","fn":"viewCol","args":["Humans","name"]}]},{"ns":"op","fn":"prop","args":["height",{"ns":"op","fn":"viewCol","args":["Humans","height"]}]},{"ns":"op","fn":"prop","args":["Cars",{"ns":"op","fn":"col","args":["Cars"]}]},{"ns":"op","fn":"prop","args":["Laptops",{"ns":"op","fn":"col","args":["Laptops"]}]}]]}]}],null]},{"ns":"op","fn":"group-by","args":[null,[{"ns":"op","fn":"array-aggregate","args":[{"ns":"op","fn":"col","args":["Humans"]},{"ns":"op","fn":"col","args":["Humans"]},null]}]]},{"ns":"op","fn":"select","args":[[{"ns":"op","fn":"as","args":["data",{"ns":"op","fn":"json-object","args":[[{"ns":"op","fn":"prop","args":["Humans",{"ns":"op","fn":"col","args":["Humans"]}]}]]}]}],null]}]}};
const rawExpectedResult = {"data":{"Humans":[{"id":1, "name":"John", "height":70, "Cars":[{"ownerId":1, "model":"Accord", "year":"2013"}], "Laptops":[]}, {"id":2, "name":"Jim", "height":75, "Cars":[], "Laptops":[{"ownerId":2, "model":"HP", "screenSize":"15"}]}, {"id":3, "name":"Joe", "height":80, "Cars":[], "Laptops":[]}, {"id":1000, "name":"Jane", "height":65, "Cars":[{"ownerId":1000, "model":"Sonata", "year":"2017"}, {"ownerId":1000, "model":"Camry", "year":"2015"}], "Laptops":[{"ownerId":1000, "model":"HP", "screenSize":"17"}, {"ownerId":1000, "model":"Apple", "screenSize":"13"}]}, {"id":1001, "name":"Jenny", "height":65, "Cars":[], "Laptops":[]}, {"id":1002, "name":"Joan", "height":65, "Cars":[], "Laptops":[]}]}};
const nb = new NodeBuilder();
nb.addNode(rawExpectedResult);
const expectedResults = nb.toNode();
const assertions = [];

// Given a query with the query keyword and query name
// When the parse is called
let response = transformGraphqlIntoOpticPlan(simpleGraphQlJoinQueryString);
// Then the returned Optic DSL is what is expected.
console.log("expectedOpticPlanExport:\n" + JSON.stringify(expectedOpticPlanExport));
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
assertions.push(
    test.assertTrue(deepEqual(xdmp.toJSON(expectedOpticPlanExport),xdmp.toJSON(response.opticPlan.export())),
        "The resulting Optic Plan does not match the expected Optic Plan")
)
// Then the result set of the Optic query is what is expected.
let actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + expectedResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(expectedResults, actualResult),
        "The resulting data set does not match the expected results.")
)

assertions