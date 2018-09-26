import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DetectorsInRun } from './detectors_in_run.entity';

@Entity('detectors')
export class Detector {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    detector_id: number;

    @Column({ type: 'varchar' })
    detector_name: string;

    @OneToMany(type => DetectorsInRun, detectorsInRun => detectorsInRun.detector)
    detectorsInRun: DetectorsInRun[];
}