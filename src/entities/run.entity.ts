import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, JoinColumn } from 'typeorm';
import { Log } from './log.entity';
import { EpnRoleSession } from './epn_role_session.entity';
import { FlpRole } from './flp_role.entity';
import { DetectorsInRun } from './detectors_in_run.entity';
import { DetectorQualityHistory } from './detector_quality_history.entity';
import { RunQualityHistory } from './run_quality_history.entity';
import { RunEorHistory } from './run_eor_history.entity';
import { Tag } from './tag.entity';

@Entity('run')
export class Run {

    @PrimaryGeneratedColumn({ name: 'run_number' })
    runNumber: number;

    @Column({
        name: 'time_o2_start',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    timeO2Start: Date;

    @Column({
        name: 'time_trg_start',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    timeTrgStart: Date;

    @Column({
        name: 'time_trg_end',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    timeTrgEnd: Date;

    @Column({
        name: 'time_o2_end',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    timeO2End: Date;

    @Column({
        name: 'activity_id',
        type: 'char',
        length: 64
    })
    activityId: string;

    @Column({
        name: 'run_type',
        type: 'enum',
        enum: ['test'],
    })
    runType: ['test'];

    @Column({
        name: 'run_quality',
        type: 'enum',
        enum: ['test'],
    })
    runQuality: ['test'];

    @Column({ name: 'n_detectors' })
    nDetectors: number;

    @Column({ name: 'n_flps' })
    nFlps: number;

    @Column({ name: 'n_epns' })
    nEpns: number;

    @Column({ name: 'n_timeframes' })
    nTimeframes: number;

    @Column({ name: 'n_subtimeframes'})
    nSubtimeframes: number;

    @Column({ name: 'bytes_read_out' })
    bytesReadOut: number;

    @Column({ name: 'bytes_timeframe_builder' })
    bytesTimeframeBuilder: number;

    @ManyToMany(type => Tag)
    @JoinTable({
        name: 'tags_in_run',
        joinColumn: {
            name: 'fk_run_id',
            referencedColumnName: 'runNumber'
        },
        inverseJoinColumn: {
            name: 'fk_tag_id',
            referencedColumnName: 'tagId'
        }
    })
    tags: Tag[];

    @ManyToMany(type => Log, log => log.runs)
    logs: Log[];

    @OneToMany(type => EpnRoleSession, epnRoleSession => epnRoleSession.run)
    epnRoleSessions: EpnRoleSession[];

    @OneToMany(type => FlpRole, flpRole => flpRole.run)
    flpRoles: FlpRole[];

    @OneToMany(type => DetectorsInRun, detectorsInRun => detectorsInRun.run)
    detectorsInRun: DetectorsInRun[];

    @OneToMany(type => DetectorQualityHistory, detectorQualityHistory => detectorQualityHistory.run)
    detectorQualityHistories: DetectorQualityHistory[];

    @OneToMany(type => RunQualityHistory, runQualityHistory => runQualityHistory.run)
    runQualityHistories: RunQualityHistory[];

    @OneToMany(type => RunEorHistory, runEorHistory => runEorHistory.run)
    runEorHistories: RunEorHistory[];
}
