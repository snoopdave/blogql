/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Entry} from "./graphql/schema";
import {CardColumns} from "react-bootstrap";
import BlogCard from "./BlogCard";
import React from "react";

interface BlogColumnsProps {
    loggedIn: boolean;
    handle: string;
    entries: Entry[];
}

function BlogColumns(props: BlogColumnsProps) {
    return <CardColumns>{
        props.entries.map((entry: Entry) => entry ? (
            <BlogCard loggedIn={props.loggedIn}
                  title={entry.title}
                  content={entry.content}
                  entryId={entry.id}
                  handle={props.handle}
                  updated={entry.updated}
            />
        ) : null)
    }</CardColumns>
}

export default BlogColumns;
