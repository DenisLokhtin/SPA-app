create database if not exists spa;

use spa;

create table users
(
    id           serial
        constraint "PK_a3ffb1c0c8416b9fc6f907b7433"
            primary key,
    email        varchar not null
        constraint "UQ_97672ac88f789774dd47f7c8be3"
            unique,
    "userName"   varchar not null,
    password     varchar not null,
    access_token varchar
);

alter table users
    owner to postgres;

create table comments
(
    id         serial
        constraint "PK_8bf68bc960f2b69e818bdb90dcb"
            primary key,
    mpath      varchar                  default ''::character varying,
    "parentId" integer
        constraint "FK_8770bd9030a3d13c5f79a7d2e81"
            references comments,
    created_at timestamp with time zone default now() not null,
    rating     integer                  default 0     not null,
    text       varchar                                not null,
    file       varchar,
    "homePage" varchar,
    "authorId" integer
        constraint "FK_4548cc4a409b8651ec75f70e280"
            references users
            on delete cascade
);

alter table comments
    owner to postgres;

create table comments_rating_up_users
(
    "commentsId" integer not null
        constraint "FK_de47e641adb838f3245a913c3d0"
            references comments
            on update cascade on delete cascade,
    "usersId"    integer not null
        constraint "FK_7fe20b55e339a7c324e39a49ad6"
            references users
            on update cascade on delete cascade,
    constraint "PK_e077ffa076e22aba6021ece56a9"
        primary key ("commentsId", "usersId")
);

alter table comments_rating_up_users
    owner to postgres;

create index "IDX_de47e641adb838f3245a913c3d"
    on comments_rating_up_users ("commentsId");

create index "IDX_7fe20b55e339a7c324e39a49ad"
    on comments_rating_up_users ("usersId");

create table comments_rating_down_users
(
    "commentsId" integer not null
        constraint "FK_d9fb879f017a136d56bc226ac9f"
            references comments
            on update cascade on delete cascade,
    "usersId"    integer not null
        constraint "FK_5033943a0f0d42ffdb7977b882a"
            references users
            on update cascade on delete cascade,
    constraint "PK_61e35a2e5bb9db04001a6dd6b4e"
        primary key ("commentsId", "usersId")
);

alter table comments_rating_down_users
    owner to postgres;

create index "IDX_d9fb879f017a136d56bc226ac9"
    on comments_rating_down_users ("commentsId");

create index "IDX_5033943a0f0d42ffdb7977b882"
    on comments_rating_down_users ("usersId");