import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { BoardEntity } from './board.entity';

export enum BoardRoleEnum {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

@Entity('board_members')
export class BoardMemberEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  boardId: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'enum', enum: BoardRoleEnum, default: BoardRoleEnum.MEMBER })
  role: BoardRoleEnum;

  @ManyToOne(() => BoardEntity, board => board.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'boardId' })
  board: BoardEntity;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;
}
