/*
 * Copyright (C) 2018 Amsterdam University of Applied Sciences (AUAS)
 *
 * This software is distributed under the terms of the
 * GNU General Public Licence version 3 (GPL) version 3,
 * copied verbatim in the file "LICENSE"
 */

import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Log } from '../entities/log.entity';
import { ThreadDto } from '../dtos/thread.dto';
import { CreateCommentDto } from '../dtos/create.comment.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ThreadService {

    private readonly logRepository: Repository<Log>;

    constructor(@InjectRepository(Log) logRepository: Repository<Log>) {
        this.logRepository = logRepository;
    }

    /**
     * Creates a Comment on a Log
     * RootId refers to the root Log
     * ParentId refers to the direct parent Log
     * @param createCommentDto
     */
    async addCommentToThread(createCommentDto: CreateCommentDto): Promise<Log> {
        const logEntity = plainToClass(Log, createCommentDto);
        logEntity.commentFkRootLogId = createCommentDto.rootId;
        logEntity.commentFkParentLogId = createCommentDto.parentId;
        logEntity.creationTime = new Date();
        logEntity.subtype = 'comment';
        logEntity.origin = 'human';

        const parent = await this.logRepository.findOne(createCommentDto.parentId);
        const root = await this.logRepository.findOne(createCommentDto.rootId);

        if (root.subtype !== 'run') {
            throw new HttpException('Unable to create the comment because the subType of the root isn\'t a run.', 418);
        }
        if (!root || !parent) {
            throw new HttpException(
                `The root with id: ${createCommentDto.rootId} or
                parent with id: ${createCommentDto.parentId} doesn't exist.`,
                404);
        }
        if (parent.subtype === 'run' && parent.logId !== root.logId) {
            throw new HttpException(
                'Unable to create comment because root and parent are different but both have run subtype.',
                418);
        }

        const newComment = await this.logRepository.save(logEntity);
        return newComment;
    }

    /**
     * Find a thread by run id with it's comments
     * @param logId number
     */
    async findThreadById(logId: number): Promise<ThreadDto> {
        // Fetch the Log by given logId
        const log = await this.logRepository.findOne(logId);
        // Fetch the root Log
        let root: Log;
        if (logId === log.commentFkRootLogId) {
            root = log;
        } else {
            root = await this.logRepository.findOne({
                where: {
                    subtype: 'run',
                    logId: log.commentFkRootLogId
                }
            });
        }

        if (!root) {
            throw new HttpException('Couldn\'t find the root log of the given logId.', 404);
        }
        // Fetch all comments of root Log
        const comments = await this.logRepository.find({
            where: [{
                commentFkRootLogId: root.logId,
                logId: Not(root.logId)
            }, {
                commentFkRootLogId: root.logId,
                logId: Not(log.logId)
            }]
        });
        if (comments.length === 0 && log.subtype === 'comment') {
            throw new HttpException('This root doens\'t cointain any comments.', 404);
        }

        const thread = this.createThreadStructure(root, comments);
        return thread;
    }

    /**
     * Creates the thread hierarchy
     * @param rootLog The root Log with subtype 'run' which is also the topic of the thread
     * @param comments The Logs which are comments on the topic
     */
    private createThreadStructure(rootLog: Log, comments: Log[]): ThreadDto {
        let thread = new ThreadDto();
        thread = rootLog.toThreadDto();
        thread.comments = [];

        comments
            .sort((x, y) => {
                const a = x.creationTime;
                const b = y.creationTime;
                return a > b ? 1 : b > a ? -1 : 0;
            });

        thread = this.addSubComment(comments, thread.logId, thread);
        return thread;
    }

    private addSubComment(comments: Log[], parentId: number, thread: ThreadDto): any {
        // tslint:disable-next-line:prefer-for-of
        for (let a = 0; a < comments.length; a++) {
            if (comments[a].commentFkParentLogId === parentId) {
                const subComment = comments[a].toThreadDto();
                subComment.comments = [];
                thread.comments.push(subComment);
                comments.splice(a, 1);
                a--;
                this.addSubComment(comments, subComment.logId, subComment);
            }
        }
        return thread;
    }
}
