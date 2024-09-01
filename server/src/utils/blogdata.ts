/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {faker} from '@faker-js/faker';
import DBConnection from "./dbconnection.js";
import {UserStore} from "../users/userstore.js";
import BlogStore from "../blogs/blogstore.js";
import {EntryStore} from "../entries/entrystore.js";
import {Entry} from "../entries/entry.js";

const startDate = new Date('2022-01-01');

export async function createSampleData(path: string) {
    console.log(`Using database path: ${path}`);

    const conn = new DBConnection(path);
    const userStore = new UserStore(conn)
    await userStore.init();
    const blogStore = new BlogStore(conn)
    await blogStore.init();
    const entryStore = new EntryStore(conn)
    await entryStore.init();

    for (let i = 0; i < 20; i++) {
        const user = await userStore.create(
            faker.internet.userName(),
            faker.internet.email(),
            faker.internet.avatar()
        );

        for (let j = 0; j < 1; j++) {
            const blog = await blogStore.create(
                user.id,
                faker.lorem.slug(6),
                faker.lorem.words(3)
            );

            for (let k = 0; k < 20; k++) {
                const entry: Entry = await entryStore.create(
                    blog.id,
                    faker.lorem.sentence(),
                    faker.lorem.paragraphs(3)
                );
                const updated = randomDateWithinOneYear(startDate);
                await Entry.update(
                    { updated, published: updated },
                    { where: { id: entry.id } }
                );
            }
        }
    }
}

function randomDateWithinOneYear(startDate: Date): Date {
    const end = new Date(startDate);
    end.setFullYear(end.getFullYear() + 1);

    return new Date(startDate.getTime() + Math.random() * (end.getTime() - startDate.getTime()));
}

// When run from terminal create sample data
if (process.stdout.isTTY) {
    let dbPath = './defaultDatabase.db';
    for (let i = 0; i < process.argv.length; i++) {
        if (process.argv[i] === '--db') {
            if (i + 1 < process.argv.length) {
                dbPath = process.argv[i + 1];
            } else {
                console.log('No database file specified after --db option.');
                process.exit(1);
            }
        }
    }
    createSampleData(dbPath);
}
