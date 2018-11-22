/*
 * Copyright (C) 2018 Amsterdam University of Applied Sciences (AUAS)
 *
 * This software is distributed under the terms of the
 * GNU General Public Licence version 3 (GPL) version 3,
 * copied verbatim in the file "LICENSE"
 */

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'secretKey',
        });
    }

    async validate(payload: JwtPayload): Promise<any> {
        console.log('Validating jwt');
        if (!payload.is_subsystem) {
            console.log('user validation');
            const user = await this.authService.validateUserJwt(payload);
            console.log('user:');
            console.log(await user);
            if (!user) {
                throw new UnauthorizedException();
            }
            return user;
        } else {
            console.log('machine validation');
            const subSystem = await this.authService.validateSubSystemJwt(payload);
            if (!subSystem) {
                throw new UnauthorizedException();
            }
            return subSystem;
        }
    }
}