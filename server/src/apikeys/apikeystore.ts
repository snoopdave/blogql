/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {v4 as uuid} from 'uuid';
import {DataSource} from "apollo-datasource";
import DBConnection from "../utils/dbconnection.js";
import sequelize from 'sequelize';
import {randomString} from "../utils/utils.js";
import {ApiKey} from "./apikey.js";
import {DataSourceConfig} from "apollo-datasource/src";


export default class ApiKeyStore implements DataSource<ApiKey> {
   db: sequelize.Sequelize;

   constructor(conn: DBConnection) {
      this.db = conn.db;
   }

   initialize?(config: DataSourceConfig<ApiKey>): void | Promise<void> {
   }

   async init() {
      await ApiKey.initialize(this.db);
   }

   async issue(userId: string): Promise<string> {
      // user can have one and only one key
      const existingKey: ApiKey | null = await ApiKey.findOne({where: {userId}});
      const newKey = randomString(10);
      if (existingKey) { // issue and replace existing apiKey
         const [number] = await ApiKey.update({
                apiKey: newKey,
                created: new Date().getTime()
             },
             {where: {id: existingKey.id}});
         if (number === 0) {
            throw Error('ApiKey not found');
         } else if (number > 1) {
            throw Error('Unexpected error: multiple entries updated');
         }
      } else { // issue new apiKey
         const createdApiKey = ApiKey.build({
            id: `${uuid()}-apikey`,
            userId,
            apiKey: newKey,
            created: new Date().getTime(),
         });
         await createdApiKey.save();
      }
      return newKey;
   }

   async delete(userId: string) {
      const number = await ApiKey.destroy({where: {userId}});
      if (number === 0) {
         throw Error('API key not found');
      } else if (number > 1) {
         throw Error('Unexpected error: multiple keys deleted');
      }
   }

   async verify(userId: string, apiKey: string): Promise<boolean> {
      const keyOnRecord: ApiKey | null = await ApiKey.findOne({where: {userId}});
      if (keyOnRecord) {
         return keyOnRecord.apiKey === apiKey;
      }
      return false;
   }

   async lookupUserId(apiKey: string): Promise<string> {
      const keyOnRecord: ApiKey | null = await ApiKey.findOne({where: {apiKey}});
      if (keyOnRecord) {
         return keyOnRecord.userId;
      }
      throw new Error('Invalid API Key');
   }
}
