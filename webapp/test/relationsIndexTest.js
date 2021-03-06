var expect = require('chai').expect;
var elasticSearch = require('elasticsearch');
var Technologies = require('../server/technologies');
var initializeIndices = require('../distribution/initializeIndices');


var host = 'localhost:9200';
var index = 'relations_test';

var client = new elasticSearch.Client({
    host: host
});

var technologies = new Technologies(host, index);

var createRelation = function (t1, t2, v) {
    var data = function (t1, t2, v, plus) {
        return {
            index: index,
            type: "relations",
            id: t1 + "_" + t2 + "_" + plus,
            body: {
                t1: t1,
                t2: t2,
                v: v,
                plus: plus
            }
        };
    };

    return client.index(data(t1, t2, v, true))
        .then( function () { return client.index(data(t1, t2, -v, false)); })
        .then( function () { return client.indices.refresh( { index: index, force: true }); });
};

describe('Relations Index', function () {

    beforeEach(function (done) {
        initializeIndices(host, index, function () {
            done();
        });
    });

    afterEach(function (done) {
        client.indices.delete({ index: index }, function () {
            done();
        });
    });

    it('should find only positive values when no avoid specified', function (done) {
        // given
        createRelation('c#', 'linq', 500)
            .then(createRelation('java', 'spring', 1000))

            // when
            .then(function () { return technologies.getSuggestionsRaw(['java'], []) })

            // then
            .then(function (results) {
                var buckets = results.aggregations.rel.buckets;

                expect(buckets).to.have.length(1);
                expect(buckets[0].key).to.eql('spring');
                expect(buckets[0].doc_count).to.eql(1);
                expect(buckets[0].total.value).to.eql(1000);

                done();
            });
    });

    it('decrease value if avoid specified', function (done) {
        // given
        createRelation('java', 'spring', 1000)
            .then(createRelation('scala', 'spring', 700))

            // when
            .then(function () { return technologies.getSuggestionsRaw(['java'], ['scala']) })

            // then
            .then(function (results) {
                var buckets = results.aggregations.rel.buckets;

                expect(buckets).to.have.length(1);
                expect(buckets[0].key).to.eql('spring');
                expect(buckets[0].doc_count).to.eql(2);
                expect(buckets[0].total.value).to.eql(300);

                done();
            });
    });

    it('results should be ordered by v descending', function (done) {
        // given
        createRelation('java', 'spring', 1000)
            .then(createRelation('java', 'maven', 700))
            .then(createRelation('java', 'gradle', 900))

            // when
            .then(function () { return technologies.getSuggestionsRaw(['java'], ['scala']) })

            // then
            .then(function (results) {
                var buckets = results.aggregations.rel.buckets;

                expect(buckets).to.have.length(3);
                expect(buckets[0].key).to.eql('spring');
                expect(buckets[1].key).to.eql('gradle');
                expect(buckets[2].key).to.eql('maven');;

                done();
            });
    });

});
