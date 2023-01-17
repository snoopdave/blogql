/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Entry} from "../graphql/schema";
import {CardColumns} from "react-bootstrap";
import EntryCard from "./EntryCard";
import React from "react";

interface EntryColumnsProps {
    loggedIn: boolean;
    handle: string;
    entries: Entry[];
}

function EntriesColumns(props: EntryColumnsProps) {
    return <CardColumns>{
        props.entries.map((entry: Entry) => entry ? (
            <EntryCard loggedIn={props.loggedIn}
                       title={entry.title}
                       content={entry.content}
                       entryId={entry.id}
                       handle={props.handle}
                       updated={entry.updated}
            />
        ) : null)
    }</CardColumns>
}

export default EntriesColumns;
