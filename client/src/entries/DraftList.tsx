/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Entry} from "../graphql/schema";
import {Table} from "react-bootstrap";
import {Link} from "react-router-dom";
import {SimpleDateTime} from "../common/DateTime";
import React from "react";

interface DraftListProps {
    handle: string;
    drafts: Entry[];
}

function DraftList(props: DraftListProps) {
    return <Table striped bordered hover>
        <thead>
        <tr>
            <th>Title</th>
            <th>Updated</th>
        </tr>
        </thead>
        <tbody>{ props.drafts.map((entry: Entry) => entry ? (
            <tr key={entry.id}>
                <td><Link className='nav-link' to={`/blogs/${props.handle}/edit/${entry.id}`}>{entry.title}</Link></td>
                <td><span className="nav-link"><SimpleDateTime when={entry.updated}/></span></td>
            </tr> ) : null)
        }</tbody>
    </Table>;
}

export default DraftList;