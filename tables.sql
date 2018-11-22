CREATE TABLE `questions` (
  `question_id` int(11) NOT NULL,
  `is_answered` int(11) DEFAULT NULL,
  `creation_date` datetime NOT NULL,
  `title` varchar(256) DEFAULT NULL,
  `answer_count` int(11) DEFAULT NULL,
  `last_edit_date` datetime DEFAULT NULL,
  `last_activity_date` datetime DEFAULT NULL,
  `link` varchar(256) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  PRIMARY KEY (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


Create View `answering_success_monthly` AS select year(`so_dashboard`.`questions`.`creation_date`) AS `Year`,month(`so_dashboard`.`questions`.`creation_date`) AS `Month`,sum(`so_dashboard`.`questions`.`is_answered`) AS `answered`,count(0) AS `total`,(count(0) - sum(`so_dashboard`.`questions`.`is_answered`)) AS `diff` from `so_dashboard`.`questions` group by `Year`,`Month` order by `so_dashboard`.`questions`.`creation_date`;


Create View `answering_success_weekly` AS select year(`so_dashboard`.`questions`.`creation_date`) AS `Year`,week(`so_dashboard`.`questions`.`creation_date`,0) AS `Week`,sum(`so_dashboard`.`questions`.`is_answered`) AS `answered`,count(0) AS `total`,(count(0) - sum(`so_dashboard`.`questions`.`is_answered`)) AS `diff` from `so_dashboard`.`questions` group by `Year`,`Week` order by `so_dashboard`.`questions`.`creation_date`;

create view `tagcount_total` as 
select count(tag_id) as count, tag_id as tag from questions_tags
group by tag_id

create view `tagcount_ecs` as 
select count(tmp.tag_id), tmp.tag_id 
from(
SELECT JSON_SEARCH(q.tags, 'one', 'alibaba-cloud-ecs') as hit, qt.tag_id
from questions q, questions_tags qt
where q.question_id = qt.question_id) as tmp
where tmp.hit IS NOT NULL AND
tmp.tag_id <> 'alibaba-cloud' AND
tmp.tag_id <> 'alibaba-cloud-ecs'
group by tag_id

create view `tagcount_rds` as 
select count(tmp.tag_id), tmp.tag_id 
from(
SELECT JSON_SEARCH(q.tags, 'one', 'alibaba-cloud-rds') as hit, qt.tag_id
from questions q, questions_tags qt
where q.question_id = qt.question_id) as tmp
where tmp.hit IS NOT NULL AND
tmp.tag_id <> 'alibaba-cloud' AND
tmp.tag_id <> 'alibaba-cloud-ecs' AND
tmp.tag_id <> 'alibaba-cloud-rds'
group by tag_id

create view `tagcount_alicloud` as 
select count(tmp.tag_id), tmp.tag_id 
from(
SELECT JSON_SEARCH(q.tags, 'one', 'alibaba-cloud') as hit, qt.tag_id
from questions q, questions_tags qt
where q.question_id = qt.question_id) as tmp
where tmp.hit IS NOT NULL AND
tmp.tag_id <> 'alibaba-cloud' AND
tmp.tag_id <> 'alibaba-cloud-ecs' AND
tmp.tag_id <> 'alibaba-cloud-rds'
group by tag_id

SET FOREIGN_KEY_CHECKS = 0;
SET FOREIGN_KEY_CHECKS = 1;


/*
TAGS TABLE
*/

CREATE TABLE tags (
     tag_id CHAR(64) NOT NULL UNIQUE,
     PRIMARY KEY (tag_id)
);

CREATE TABLE questions_tags (
    question_id INT(11),
    tag_id CHAR(64),
    INDEX q_ind (question_id),
    INDEX t_ind (tag_id),
) 

select count(tmp.tag_id), tmp.tag_id 
from(
SELECT JSON_SEARCH(q.tags, 'one', 'alibaba-cloud-rds') as hit, qt.tag_id
from questions q, questions_tags qt
where q.question_id = qt.question_id) as tmp
where tmp.hit IS NOT NULL
group by tag_id


select count(tmp.tag_id), tmp.tag_id 
from(
SELECT JSON_SEARCH(q.tags, 'one', 'alibaba-cloud-ecs') as hit, qt.tag_id
from questions q, questions_tags qt
where q.question_id = qt.question_id) as tmp
where tmp.hit IS NOT NULL AND
tmp.tag_id <> 'alibaba-cloud' AND
tmp.tag_id <> 'alibaba-cloud-ecs'
group by tag_id