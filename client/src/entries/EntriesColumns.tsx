/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Entry} from "../graphql/schema";
import React from "react";
import EntryCard from "./EntryCard";
import {List} from "antd";

interface EntryColumnsProps {
    loggedIn: boolean;
    handle: string;
    entries: Entry[];
}

function EntriesColumns(props: EntryColumnsProps) {
    return <List itemLayout={'vertical'}>{
        props.entries.map((entry: Entry) => entry ? (
            <EntryCard loggedIn={props.loggedIn}
                       title={entry.title}
                       content={entry.content}
                       entryId={entry.id}
                       handle={props.handle}
                       updated={entry.updated}
            />
        ) : null)
    }</List>
}

export default EntriesColumns;
