const sql = require('mssql')
const connectionDSN = require('./../connection')

const migrate = async () => {
  await sql.connect(connectionDSN)

  return await sql.query(`
    create table challenges
    (
      id          int          not null
        constraint challenges_pk
          primary key nonclustered,
      description varchar(250) not null,
      result_sql  varchar(max) not null
    );

    create table user_challenge
    (
      user_id      varchar(40) not null,
      challenge_id int         not null
        constraint user_challenge_challenges_id_fk
          references challenges,
      constraint user_challenge_pk
        primary key nonclustered (user_id, challenge_id)
    );
  `)
}

migrate().then(res => {
})
