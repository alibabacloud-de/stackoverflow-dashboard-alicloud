const BbPromise = require('bluebird');

(() => BbPromise.resolve().then(() => {
    const mysql = require('promise-mysql'),
        rp = require('request-promise');

    let questions = [];

    const todate = today();

    rp({ uri: `http://api.stackexchange.com/2.2/search?fromdate=2018-01-01&todate=${todate}&order=desc&sort=activity&tagged=alibaba-cloud;alibaba-cloud-ecs;alibaba-cloud-rds;alibaba-cloud-direct-mail;alibaba-cloud-ros;alibaba-cloud-function-compute&site=stackoverflow&filter=total`, json: true, gzip: true })
        .then(res => {
            const total = Math.ceil(res.total / 30);
            const promises = [];
            for (let i = 1; i <= total; ++i) {
                promises.push(rp({ uri: `http://api.stackexchange.com/2.2/search?fromdate=2018-01-01&todate=${todate}&order=desc&sort=activity&tagged=alibaba-cloud;alibaba-cloud-ecs;alibaba-cloud-rds;alibaba-cloud-direct-mail;alibaba-cloud-ros;alibaba-cloud-function-compute&site=stackoverflow&page=${i}`, json: true, gzip: true }));
            }
            return BbPromise.all(promises)
                .then((results) => {
                    for (const result of results) {
                        questions = questions.concat(result.items);
                    }
                    return questions;
                });
        }).then(questions => {
            return mysql.createConnection({
                host: 'rm-4xowqez7h3826v706ko.mysql.germany.rds.aliyuncs.com',
                user: 'so',
                password: '!QAYxsw2',
                database: 'so_dashboard'
            })
            .then((conn) => {
                for (const q of questions) {
                    // TAGS
                    const tagsQuery = createInsertTagsQuery(q.tags);
                    console.log('Tags: Executing query: ' + tagsQuery);
                    conn.query(tagsQuery)
                    console.log('Tags: DONE.');

                    // QUESTIONS
                    const jsonTags = {};
                    jsonTags.tags = q.tags;
                    const jsonStr = JSON.stringify(jsonTags);
                    const questionsQuery = `insert ignore into so_dashboard.questions values (${q.question_id}, ${q.is_answered}, ${convertDateTime(q.creation_date)}, "${q.title}", ${q.answer_count}, ${convertDateTime(q.last_edit_date)}, ${convertDateTime(q.last_activity_date)}, "${q.link}", '${jsonStr}')`; 
                    console.log('Questions: Executed query: ' + questionsQuery);
                    const result = conn.query(questionsQuery);
                    console.log('*** Questions: DONE');

                    // N:M Association
                    for (const tag of q.tags) {
                        const assocQuery = `insert ignore into so_dashboard.questions_tags values (${q.question_id}, "${tag}")`;
                        console.log('Assoc: Executing query: ' + assocQuery);
                        conn.query(assocQuery);
                        console.log('*** Assoc: DONE');
                    }
                    console.log('COMPLETELY FINISHED QUESTION');
                }
                conn.end();
            });
        }).catch(err => {
            console.log(JSON.stringify(err));
        });
}))();

function convertDateTime(date) {
    if (date === null || date == undefined) {
        return null;
    }
    return `"${new Date(date*1000).toISOString().slice(0, 19).replace('T', ' ')}"`;
}

function createInsertTagsQuery(tags) {
    let query = `insert ignore into so_dashboard.tags (tag_id) values `
    let initial = true;
    for (const tag of tags) {
        if (initial) {
            query = query.concat(`('${tag}')`);
            initial = false;
            continue;
        }
        query = query.concat(`,('${tag}')`)
    }
    return query;
}

function today() {
    const d = new Date()
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDay())}`;
}

function pad(n) { 
    return n < 10 ? '0' + n : n
}

// http://api.stackexchange.com/2.2/search?fromdate=2018-01-01&todate=2018-09-30&order=desc&sort=activity&tagged=alibaba-cloud;alibaba-cloud-ecs;alibaba-cloud-rds;alibaba-cloud-direct-mail;alibaba-cloud-ros;alibaba-cloud-function-compute&site=stackoverflow







// SELECT YEAR(creation_date) AS Year, DATE_FORMAT(creation_date, '%b %e') AS Week, SUM(is_answered) AS answered, count(*) as total
// FROM so_dashboard.questions
// GROUP BY Year, Week
// order by creation_date asc

// SELECT YEAR(creation_date) AS Year, MONTH(creation_date) AS Month, SUM(is_answered) AS answered, count(*) as total
// FROM so_dashboard.questions
// GROUP BY Year, Month
// order by creation_date asc

// SELECT YEAR(creation_date) AS Year, MONTH(creation_date) AS Month, SUM(is_answered) AS answered, count(*) as total, (count(*) - SUM(is_answered)) as diff
// FROM so_dashboard.questions
// GROUP BY Year, Month
// order by creation_date asc