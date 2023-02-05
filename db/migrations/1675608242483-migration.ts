import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1675608242483 implements MigrationInterface {
  name = 'migration1675608242483';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "rateUsers" ("id" SERIAL NOT NULL, "rating" integer NOT NULL, "userId" integer, "commentId" integer, CONSTRAINT "PK_9ad30bddef77a24e6c1a29ef207" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_9b40c89e0e418131ab6951ca6f" ON "rateUsers" ("userId", "commentId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "userName" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "comments" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "rating" integer NOT NULL DEFAULT '0', "file" character varying, "homePage" character varying, "text" character varying NOT NULL, "mpath" character varying DEFAULT '', "authorId" integer, "parentId" integer, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "rateUsers" ADD CONSTRAINT "FK_ea7e463dc11ee703ca194d61b2a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rateUsers" ADD CONSTRAINT "FK_ed18407376809c6ca76ea7190a6" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_4548cc4a409b8651ec75f70e280" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_8770bd9030a3d13c5f79a7d2e81" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_8770bd9030a3d13c5f79a7d2e81"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_4548cc4a409b8651ec75f70e280"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rateUsers" DROP CONSTRAINT "FK_ed18407376809c6ca76ea7190a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rateUsers" DROP CONSTRAINT "FK_ea7e463dc11ee703ca194d61b2a"`,
    );
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9b40c89e0e418131ab6951ca6f"`,
    );
    await queryRunner.query(`DROP TABLE "rateUsers"`);
  }
}
