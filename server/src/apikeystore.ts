/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */


import { v4 as uuid } from 'uuid';
import { DataSource, DataSourceConfig } from "apollo-datasource";
import {Node} from "./node";
import DBConnection from "./dbconnection";
import sequelize from 'sequelize';
import {randomString} from "./utils";
import {Blog} from "./blogstore";
import { AuthenticationError } from 'apollo-server';
const { DataTypes, Model } = sequelize; // sequelize is a CommonJS module


export class ApiKey extends Model implements Node {
   declare id: string;
   declare userId: string;
   declare apiKey: string;
   declare created: string;
}

export class ApiKeyStore implements DataSource<ApiKey> {
   db: sequelize.Sequelize;

   constructor(conn: DBConnection) {
      this.db = conn.db;
   }

   initialize?(config: DataSourceConfig<ApiKey>): void | Promise<void> {
   }

   async init() {
      ApiKey.init({
         id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
         },
         apiKey: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'api_key',
         },
         userId: {
            type: DataTypes.STRING,
            allowNull: false,
         },
         created: {
            type: DataTypes.DATE,
            allowNull: false
         },
      }, {
         sequelize: this.db,
         modelName: 'apiKey'
      });
      await ApiKey.sync();
   }

   async issue(userId: string): Promise<string> {
      // user can have one and only one key
      const existingKey: ApiKey | null = await ApiKey.findOne({where: {userId}});
      const now = new Date();
      const newKey = randomString(10);
      if (existingKey) { // issue and replace existing apiKey
         const [number] = await ApiKey.update({
                apiKey: newKey,
                created: now
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
            created: now,
         });
         await createdApiKey.save();
      }
      return newKey;
   }

   async delete(userId: string) {
      const number = await Blog.destroy({where: {userId}});
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
      throw new AuthenticationError('Invalid API Key');
   }
}
