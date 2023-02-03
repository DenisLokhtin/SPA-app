import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1675341843637 implements MigrationInterface {
  name = 'migration1675341843637';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "userName" character varying NOT NULL, "password" character varying NOT NULL, "access_token" character varying, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "comments" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "rating" integer NOT NULL DEFAULT '0', "file" character varying, "homePage" character varying, "text" character varying NOT NULL, "mpath" character varying DEFAULT '', "authorId" integer, "parentId" integer, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "comments_rating_up_users" ("commentsId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_e077ffa076e22aba6021ece56a9" PRIMARY KEY ("commentsId", "usersId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_de47e641adb838f3245a913c3d" ON "comments_rating_up_users" ("commentsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7fe20b55e339a7c324e39a49ad" ON "comments_rating_up_users" ("usersId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "comments_rating_down_users" ("commentsId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_61e35a2e5bb9db04001a6dd6b4e" PRIMARY KEY ("commentsId", "usersId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d9fb879f017a136d56bc226ac9" ON "comments_rating_down_users" ("commentsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5033943a0f0d42ffdb7977b882" ON "comments_rating_down_users" ("usersId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_4548cc4a409b8651ec75f70e280" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_8770bd9030a3d13c5f79a7d2e81" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments_rating_up_users" ADD CONSTRAINT "FK_de47e641adb838f3245a913c3d0" FOREIGN KEY ("commentsId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments_rating_up_users" ADD CONSTRAINT "FK_7fe20b55e339a7c324e39a49ad6" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments_rating_down_users" ADD CONSTRAINT "FK_d9fb879f017a136d56bc226ac9f" FOREIGN KEY ("commentsId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments_rating_down_users" ADD CONSTRAINT "FK_5033943a0f0d42ffdb7977b882a" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comments_rating_down_users" DROP CONSTRAINT "FK_5033943a0f0d42ffdb7977b882a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments_rating_down_users" DROP CONSTRAINT "FK_d9fb879f017a136d56bc226ac9f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments_rating_up_users" DROP CONSTRAINT "FK_7fe20b55e339a7c324e39a49ad6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments_rating_up_users" DROP CONSTRAINT "FK_de47e641adb838f3245a913c3d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_8770bd9030a3d13c5f79a7d2e81"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_4548cc4a409b8651ec75f70e280"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5033943a0f0d42ffdb7977b882"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d9fb879f017a136d56bc226ac9"`,
    );
    await queryRunner.query(`DROP TABLE "comments_rating_down_users"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7fe20b55e339a7c324e39a49ad"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_de47e641adb838f3245a913c3d"`,
    );
    await queryRunner.query(`DROP TABLE "comments_rating_up_users"`);
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
