import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BoardRoleEnum } from '@shared/modules/database/entities/board-member.entity';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { randomUUID } from 'crypto';
import {
  RemoveMemberParamsDto,
  UpdateMemberRoleInputDto,
  UpdateMemberRoleParamsDto,
} from '../../dto/board.dto';
import { BoardRepositoryInterface } from '../../interfaces/board.repository.interface';
import {
  AddMemberInputDto,
  AddMemberOutputDto,
  AddMemberParamsDto,
} from './dto/manage-members.dto';

@Injectable()
export class ManageMembersUseCase {
  constructor(
    private readonly boardRepository: BoardRepositoryInterface,
    private readonly logger: WinstonLoggerService,
  ) {}

  async addMember(
    params: AddMemberParamsDto,
    input: AddMemberInputDto,
    userId: string,
  ): Promise<AddMemberOutputDto> {
    this.logger.log(`Adding member ${input.userId} to board ${params.boardId}`);

    const board = await this.boardRepository.findById(params.boardId);
    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const currentMember = await this.boardRepository.findMember(
      params.boardId,
      userId,
    );

    const isOwner = board.ownerId === userId;
    const isAdmin = currentMember?.role === BoardRoleEnum.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Only owners and admins can add members');
    }

    const existingMember = await this.boardRepository.findMember(
      params.boardId,
      input.userId,
    );

    if (existingMember) {
      throw new BadRequestException('User is already a member of this board');
    }

    const memberId = randomUUID();
    const member = await this.boardRepository.addMember(
      memberId,
      params.boardId,
      input.userId,
      input.role || BoardRoleEnum.MEMBER,
    );

    this.logger.log(`Member added successfully: ${memberId}`);

    return {
      id: member.id,
      boardId: member.boardId,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
    };
  }

  async removeMember(
    params: RemoveMemberParamsDto,
    userId: string,
  ): Promise<void> {
    this.logger.log(
      `Removing member ${params.userId} from board ${params.boardId}`,
    );

    const board = await this.boardRepository.findById(params.boardId);
    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (params.userId === board.ownerId) {
      throw new BadRequestException('Cannot remove the board owner');
    }

    const currentMember = await this.boardRepository.findMember(
      params.boardId,
      userId,
    );

    const isOwner = board.ownerId === userId;
    const isAdmin = currentMember?.role === BoardRoleEnum.ADMIN;
    const isSelf = params.userId === userId;

    if (!isOwner && !isAdmin && !isSelf) {
      throw new ForbiddenException(
        'Only owners, admins, or the member themselves can remove members',
      );
    }

    await this.boardRepository.removeMember(params.boardId, params.userId);

    this.logger.log(`Member removed successfully`);
  }

  async updateMemberRole(
    params: UpdateMemberRoleParamsDto,
    input: UpdateMemberRoleInputDto,
    userId: string,
  ): Promise<AddMemberOutputDto> {
    this.logger.log(
      `Updating role of member ${params.userId} in board ${params.boardId}`,
    );

    const board = await this.boardRepository.findById(params.boardId);
    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can update member roles');
    }

    if (params.userId === board.ownerId) {
      throw new BadRequestException('Cannot change the owner role');
    }

    const member = await this.boardRepository.updateMemberRole(
      params.boardId,
      params.userId,
      input.role,
    );

    this.logger.log(`Member role updated successfully`);

    return {
      id: member.id,
      boardId: member.boardId,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
    };
  }
}
