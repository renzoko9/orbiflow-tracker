import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversationChannel1781800286728 implements MigrationInterface {
    name = 'AddConversationChannel1781800286728'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7f9e5689ad3d7f45172fc156fb"`);
        await queryRunner.query(`ALTER TABLE "chat_conversations" ADD "channel" character varying(16) NOT NULL DEFAULT 'in_app'`);
        await queryRunner.query(`ALTER TABLE "chat_conversations" DROP CONSTRAINT "FK_7f9e5689ad3d7f45172fc156fbf"`);
        await queryRunner.query(`ALTER TABLE "chat_conversations" DROP CONSTRAINT "REL_7f9e5689ad3d7f45172fc156fb"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_cd8d21bd93d8c3bfa13668e81d" ON "chat_conversations" ("user_id", "channel") `);
        await queryRunner.query(`ALTER TABLE "chat_conversations" ADD CONSTRAINT "FK_7f9e5689ad3d7f45172fc156fbf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_conversations" DROP CONSTRAINT "FK_7f9e5689ad3d7f45172fc156fbf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cd8d21bd93d8c3bfa13668e81d"`);
        await queryRunner.query(`ALTER TABLE "chat_conversations" ADD CONSTRAINT "REL_7f9e5689ad3d7f45172fc156fb" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "chat_conversations" ADD CONSTRAINT "FK_7f9e5689ad3d7f45172fc156fbf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_conversations" DROP COLUMN "channel"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7f9e5689ad3d7f45172fc156fb" ON "chat_conversations" ("user_id") `);
    }

}
