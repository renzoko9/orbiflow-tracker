import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1781572167848 implements MigrationInterface {
    name = 'Init1781572167848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."categories_type_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "type" "public"."categories_type_enum" NOT NULL, "icon" character varying NOT NULL DEFAULT 'tag', "color" character varying NOT NULL DEFAULT '#a6a6a6', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "archived_at" TIMESTAMP, "user_id" integer, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "accounts" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "balance" numeric(10,2) NOT NULL DEFAULT '0', "description" text, "icon" character varying NOT NULL DEFAULT 'wallet', "color" character varying NOT NULL DEFAULT '#77a8a8', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "archived_at" TIMESTAMP, "user_id" integer, CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_type_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "amount" numeric(10,2) NOT NULL, "description" character varying, "type" "public"."transactions_type_enum" NOT NULL, "date" date NOT NULL, "transfer_group_id" character varying(36), "photos" text array NOT NULL DEFAULT '{}', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, "category_id" integer, "account_id" integer, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9e645dc01eedaf52951b18a4b7" ON "transactions" ("transfer_group_id") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "lastname" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "avatar_url" text, "currency" character varying NOT NULL DEFAULT 'PEN', "is_verified" boolean NOT NULL DEFAULT false, "refreshToken" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "email_verification_tokens" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "user_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3d1613f95c6a564a3b588d161ae" UNIQUE ("token"), CONSTRAINT "PK_417a095bbed21c2369a6a01ab9a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "password_reset_tokens" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "user_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ab673f0e63eac966762155508ee" UNIQUE ("token"), CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ai_insights" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "type" character varying(50) NOT NULL, "period" character varying(7) NOT NULL, "data_fingerprint" character varying(64), "content" jsonb NOT NULL, "input_tokens" integer NOT NULL DEFAULT '0', "output_tokens" integer NOT NULL DEFAULT '0', "generated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b9f050c4c7b63c358346f3aa31c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e5a51e6663092c37ba2cde76e5" ON "ai_insights" ("user_id", "type", "period", "data_fingerprint") `);
        await queryRunner.query(`CREATE TABLE "chat_messages" ("id" SERIAL NOT NULL, "conversation_id" integer NOT NULL, "role" character varying(16) NOT NULL, "content" text NOT NULL, "image_url" character varying(512), "kind" character varying(16) NOT NULL DEFAULT 'text', "payload" jsonb, "status" character varying(16), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3d623662d4ee1219b23cf61e64" ON "chat_messages" ("conversation_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_6b713229dabb850d4b7b664464" ON "chat_messages" ("conversation_id", "id") `);
        await queryRunner.query(`CREATE TABLE "chat_conversations" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_7f9e5689ad3d7f45172fc156fb" UNIQUE ("user_id"), CONSTRAINT "PK_ff117d9f57807c4f2e3034a39f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7f9e5689ad3d7f45172fc156fb" ON "chat_conversations" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_2296b7fe012d95646fa41921c8b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD CONSTRAINT "FK_3000dad1da61b29953f07476324" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_c9e41213ca42d50132ed7ab2b0f" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_49c0d6e8ba4bfb5582000d851f0" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "FK_fdcb77f72f529bf65c95d72a147" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "FK_52ac39dd8a28730c63aeb428c9c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_insights" ADD CONSTRAINT "FK_4b982463f329037b4b7d2b4cde6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_3d623662d4ee1219b23cf61e649" FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_conversations" ADD CONSTRAINT "FK_7f9e5689ad3d7f45172fc156fbf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_conversations" DROP CONSTRAINT "FK_7f9e5689ad3d7f45172fc156fbf"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_3d623662d4ee1219b23cf61e649"`);
        await queryRunner.query(`ALTER TABLE "ai_insights" DROP CONSTRAINT "FK_4b982463f329037b4b7d2b4cde6"`);
        await queryRunner.query(`ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "FK_52ac39dd8a28730c63aeb428c9c"`);
        await queryRunner.query(`ALTER TABLE "email_verification_tokens" DROP CONSTRAINT "FK_fdcb77f72f529bf65c95d72a147"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_49c0d6e8ba4bfb5582000d851f0"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_c9e41213ca42d50132ed7ab2b0f"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP CONSTRAINT "FK_3000dad1da61b29953f07476324"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_2296b7fe012d95646fa41921c8b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7f9e5689ad3d7f45172fc156fb"`);
        await queryRunner.query(`DROP TABLE "chat_conversations"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6b713229dabb850d4b7b664464"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3d623662d4ee1219b23cf61e64"`);
        await queryRunner.query(`DROP TABLE "chat_messages"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e5a51e6663092c37ba2cde76e5"`);
        await queryRunner.query(`DROP TABLE "ai_insights"`);
        await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
        await queryRunner.query(`DROP TABLE "email_verification_tokens"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9e645dc01eedaf52951b18a4b7"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
        await queryRunner.query(`DROP TABLE "accounts"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TYPE "public"."categories_type_enum"`);
    }

}
