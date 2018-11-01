/*
 * Copyright (C) 2018 Amsterdam University of Applied Sciences (AUAS)
 *
 * This software is distributed under the terms of the
 * GNU General Public Licence version 3 (GPL) version 3,
 * copied verbatim in the file "LICENSE"
 */

import { Post, Controller, Body, Get, Param } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';

import { AttachmentService } from '../services/attachment.service';
import { CreateAttachmentDto } from '../dtos/create.attachment.dto';
import { Attachment } from '../entities/attachment.entity';

@ApiUseTags('attachments')
@Controller('attachments')
export class AttachmentController {

    constructor(private readonly attachmentservice: AttachmentService) { }

    /**
     * Post a new Attachment. /attachments
     * @param request CreateAttachmentDto from frontend.
     */
    @Post()
    async create(@Body() request: CreateAttachmentDto) {
        request.creationTime = new Date();
        await this.attachmentservice.create(request);
    }

    /**
     * Find all Attachments that belong to a certain log item. /logs/id
     * @param id unique identifier for a Log item.
     */
    @Get(':id/logs')
    async findById(@Param('id') id: number): Promise<Attachment[]> {
        return await this.attachmentservice.findAttachmentsByLogId(id);
    }
}
