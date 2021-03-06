create database if not exists plannerDB;

create table if not exists plannerDB.Unit(
  unitId int primary key auto_increment,
  unitName varChar(30)
);


create table if not exists plannerDB.Week (
  weekId int primary key auto_increment,
  weekName varChar (30),
  duration int,
  positon int,
  unitId int,

  foreign key (unitId) references Unit(unitId) on delete cascade
);



create table if not exists plannerDB.WeekResources (
  resourceId int primary key auto_increment,
  WeekId int,
  fileName varChar(30),
  foreign key (weekID) references Week(weekId) on delete cascade

);

-- test data

insert into plannerDB.Unit values(null,"Fake Unit1");
insert into plannerDB.Week values(null,"Fake Week1: security",1,1,1);
insert into plannerDB.Week values(null,"Fake Week2: lit review",2,2,1);
insert into plannerDB.Week values(null,"Fake Week3: ",1,3,1);


insert into plannerDB.Unit values(null,"Fake Unit2");
insert into plannerDB.Week values(null,"Fake Week1: javascript",1,2,2);
insert into plannerDB.Week values(null,"Fake Week2:  dom",1,3,2);
insert into plannerDB.Week values(null,"Fake Week3:  css",3,1,2);


insert into plannerDB.Unit values(null,"Fake Unit3");
insert into plannerDB.Week values(null,"Fake Week1: cheese",1,2,3);
insert into plannerDB.Week values(null,"Fake Week2: chocolate",1,3,3);
insert into plannerDB.Week values(null,"Fake Week3: bacon",4,1,3);
