use demo;

select * from services;
select * from admin;

select * from services where featured = 1 ;

alter table services modify featured boolean default false;

update services set featured = false WHERE featured = NULL;

create table notesboard (notes_id int not null primary key auto_increment, image varchar(255), 
title varchar (200) , description longtext);


alter table notesboard add added_by varchar (50);

select * from notesboard;

create table admin (id int not null primary key auto_increment, email varchar(255), 
password varchar (200));
insert into admin value(null,"admin@gmail.com","123");
select * from admin;
update admin set password ="123", email = "admin@gmail.com" where id = 1;


create table events (event_id int not null primary key auto_increment, 
image varchar(255), title varchar (200) , description longtext,
added_by varchar (50), date_added datetime default current_timestamp, date_to_occur varchar (20));

select * from events;


create table news (news_id int not null primary key auto_increment, 
image varchar(255), title varchar (200) , description longtext,
added_by varchar (50), date_added datetime default current_timestamp);

select * from news;


create table tips (tips_id int not null primary key auto_increment, 
image varchar(255), title varchar (200) , description longtext,
added_by varchar (50), date_added datetime default current_timestamp);

select * from tips;


create table adverts(advert_id int not null primary key auto_increment, 
image varchar(255),  description longtext,
added_by varchar (50), date_added datetime default current_timestamp);

select * from adverts;



create table controls(control_id int not null primary key auto_increment, 
name varchar(255), 
contact varchar (14));

alter table controls modify contact varchar(20);

select * from controls;


select (select  count(id)  from services) as services , 
(select  count(tips_id)  from tips) as tips,
(select  count(event_id)  from events) as events
from dual;

create table users(user_id int not null primary key auto_increment, 
name varchar(255),  email varchar (100),
contact varchar (50),
password varchar (100),
 date_created datetime default current_timestamp);
select * from users;
alter table users add profile_image varchar(255) after password;
alter table users rename column profile_image to profileImage;

update  users set email = "adriko@gmail.com" where user_id = 1;
insert into users VALUES (null, "Kamuntu Anthony", "kamuntu1@gmail.com","07656789","123456","",null, null, null);
-- truncate table users;

delete from users where user_id = 3;
-- resetPasswordToken = ? AND resetPasswordExpires-- 
alter table users add resetPasswordToken varchar(100) null , add resetPasswordExpires varchar (100) null;

--  attendance
create table attendance(id int not null primary key auto_increment, 
worker_id varchar(255),  email varchar (100) null);
alter table attendance add date datetime default current_timestamp not null after worker_id;
alter table attendance add site_name varchar (50) after date;
select * from attendance;
alter table attendance rename column date to date_created;
alter table attendance add column date date after worker_id;

alter table attendance modify  date varchar(20);

insert into attendance (date) Values("2024-11-08");
update  attendance set date = "2024-11-08" where id = 1;
update  attendance set date = "2024-11-08" where id = 2;
update  attendance set date = "2024-11-08" where id = 3;
update  attendance set date = "2024-11-09" where id = 4;
update  attendance set date = "2024-11-09" where id = 5;
-- "2024-11-08","2024-11-08","2024-11-09","2024-11-09" 

delete from attendance where id = 6;
-- clients
create table clients(id int not null primary key auto_increment, 
name varchar(25), contact varchar (15) , email varchar (50), location varchar (100),
man_power int,  gun  int, baton int, touch int, radio_call int,
 date_added datetime default current_timestamp);

alter table clients add others varchar (100) after radio_call;
alter table clients add site_name varchar (100) after email;

alter table clients modify man_power  varchar (10) null;
alter table clients modify gun varchar (10) null;
alter table clients modify baton  varchar (10) null;
alter table clients modify touch  varchar (10) null;
alter table clients modify radio_call  varchar (10) null;

select * from clients;


-- workers
create table workers(id int not null primary key auto_increment,
image varchar(255),
worker_id varchar(25),name varchar(25),date_of_birth varchar(25),
contact varchar (15) , email varchar (50) null,
date_joined varchar (30), site int );

alter table workers add supervisor bool;

alter table workers add foreign key (site) references clients(id);
select * from workers;

select (select  count(email)  from workers) as workers, 
(select  count(*)  from users  inner join  workers on users.email = workers.email ) as users ;

-- ok
select (select  count(*)  from workers) as workers, 
count( distinct lower(trim(w.email)))  as users 
from workers w 
inner join  
users u 
on lower(trim(w.email)) =  u.email;

select (select  count(*)  from clients) as clients, 
count( distinct lower(trim(c.email)))  as users 
from clients c
inner join  
users u 
on lower(trim(c.email)) =  u.email;



-- ////
SELECT 
    (SELECT COUNT(*) FROM workers) AS total_workers_count,
    (SELECT COUNT(*) FROM clients) AS total_clients_count,
    COUNT(DISTINCT w.email) AS common_emails_count,
    (
        SELECT COUNT(DISTINCT email) 
        FROM (
            SELECT LOWER(TRIM(email)) AS email FROM workers
            UNION ALL
            SELECT LOWER(TRIM(email)) AS email FROM clients
        ) AS all_emails
        GROUP BY email
        HAVING COUNT(email) = 1
    ) AS unique_emails_count
FROM 
    workers w
INNER JOIN 
    clients c ON LOWER(TRIM(w.email)) = LOWER(TRIM(c.email));



