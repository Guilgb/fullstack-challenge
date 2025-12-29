import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BoardMemberEntity } from './board-member.entity';
import { TaskEntity } from './tasks.entity';

@Entity('boards')
export class BoardEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: false })
  ownerId: string;

  @OneToMany(() => BoardMemberEntity, member => member.board, {
    cascade: true,
  })
  members: BoardMemberEntity[];

  @OneToMany(() => TaskEntity, task => task.board)
  tasks: TaskEntity[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
