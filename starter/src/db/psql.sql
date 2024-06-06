-- DROP TABLE DEPT;
CREATE TABLE DEPT
       (DEPTNO INT PRIMARY KEY,
        DNAME VARCHAR(64),
        LOC VARCHAR(64) );

INSERT INTO DEPT VALUES (10, 'ACCOUNTING', 'TOKYO');
INSERT INTO DEPT VALUES (20, 'RESEARCH',   'POSTGRESQL');
INSERT INTO DEPT VALUES (30, 'SALES',      'BEIJING');
INSERT INTO DEPT VALUES (40, 'OPERATIONS', 'SEOUL');

CREATE EXTENSION vector;
-- postgres=> CREATE EXTENSION vector;
-- ERROR:  Extension : vector is not allowed

CREATE TABLE oic (
    id bigserial PRIMARY KEY, 

    content text,
    translation text,
    cohere_embed vector(1024),

    application_name varchar(256),
    author varchar(256),
    content_type varchar(256),
    creation_date varchar(256),    
    date varchar(256),    
    modified varchar(256),    
    other1 varchar(1024),    
    other2 varchar(1024),    
    other3 varchar(1024),    
    parsed_by varchar(256),    
    filename varchar(256),    
    path varchar(1024),    
    publisher varchar(256),    
    region varchar(256),    
    context text
);


