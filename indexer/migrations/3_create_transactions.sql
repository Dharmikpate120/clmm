-- Function trigger_set_updated_at must be defined before running this script.

-- As a style choice, we prefer to avoid plurals in table names, mainly because it makes queries read better.
--
-- For our user table, quoting the table name is recommended by IntelliJ's tooling because `user` is a keyword.
create table "transactions"
(
    id  uuid    primary key     default     uuid_generate_v1mc(),
    
    user_address    varchar(44)     not null REFERENCES users(id),

    token_in_address     varchar(44)    not null,

    token_out_address    varchar(44)    not null,

    amount_in INTEGER not null default 0,
    
    amount_out INTEGER not null default 0,

    start_tick INTEGER not null default 0,

    end_tick INTEGER not null default 0
);
