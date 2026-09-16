/*
 * Copyright (C) 2021 Sienci Labs Inc.
 *
 * This file is part of gSender.
 *
 * gSender is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, under version 3 of the License.
 *
 * gSender is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with gSender.  If not, see <https://www.gnu.org/licenses/>.
 *
 * Contact for information regarding this program and its license
 * can be sent through gSender@sienci.com or mailed to the main office
 * of Sienci Labs Inc. in Waterloo, Ontario, Canada.
 *
 */

import fs from 'fs';
import path from 'path';
import find from 'lodash/find';
import castArray from 'lodash/castArray';
import uuid from 'uuid';
import config from '../services/configstore';
import {
    ERR_BAD_REQUEST,
    ERR_NOT_FOUND,
    ERR_INTERNAL_SERVER_ERROR
} from '../constants';

const CONFIG_KEY = 'feedback';
const PRIORITIES = ['high', 'medium', 'low'];

// Images live next to the config file (outside the repo) rather than inside
// it, so records only ever store a filename reference.
export const getImagesDir = () => path.join(path.dirname(config.file), '.gsender-feedback-images');

const saveImages = (files) => {
    if (!files || files.length === 0) {
        return [];
    }

    const dir = getImagesDir();
    fs.mkdirSync(dir, { recursive: true });

    return files.map((file) => {
        const filename = `${uuid.v4()}${path.extname(file.originalname || '')}`;
        fs.writeFileSync(path.join(dir, filename), file.buffer);
        return filename;
    });
};

export const create = (req, res) => {
    const { body, sourceScreen = '', priority = 'medium' } = { ...req.body };

    if (!body || !String(body).trim()) {
        res.status(ERR_BAD_REQUEST).send({
            msg: 'The "body" parameter must not be empty'
        });
        return;
    }

    if (!PRIORITIES.includes(priority)) {
        res.status(ERR_BAD_REQUEST).send({
            msg: `The "priority" parameter must be one of ${PRIORITIES.join(', ')}`
        });
        return;
    }

    try {
        const record = {
            id: uuid.v4(),
            body,
            images: saveImages(req.files),
            sourceScreen,
            priority,
            createdAt: new Date().toISOString(),
            resolved: false,
        };

        const records = castArray(config.get(CONFIG_KEY, []));
        records.push(record);
        config.set(CONFIG_KEY, records);

        res.send({ err: null, feedback: record });
    } catch (err) {
        res.status(ERR_INTERNAL_SERVER_ERROR).send({
            msg: 'Failed to save feedback: ' + err
        });
    }
};

export const fetch = (req, res) => {
    const records = castArray(config.get(CONFIG_KEY, []));
    res.send({ records });
};

export const resolve = (req, res) => {
    const id = req.params.id;
    const records = castArray(config.get(CONFIG_KEY, []));
    const record = find(records, { id });

    if (!record) {
        res.status(ERR_NOT_FOUND).send({
            msg: 'Not found'
        });
        return;
    }

    try {
        record.resolved = true;
        record.resolvedAt = new Date().toISOString();
        config.set(CONFIG_KEY, records);

        res.send({ err: null, feedback: record });
    } catch (err) {
        res.status(ERR_INTERNAL_SERVER_ERROR).send({
            msg: 'Failed to save feedback: ' + err
        });
    }
};
