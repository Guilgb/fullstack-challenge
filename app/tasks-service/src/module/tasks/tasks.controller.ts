import { Body, Controller, Post } from '@nestjs/common';
import { CreateTaskUseCase } from './use-cases/create/create.use-case';
import {
  CreateTaskInputDto,
  CreateTaskOutputDto,
} from './use-cases/create/dto/create.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly createTaskUseCase: CreateTaskUseCase) {}

  @Post()
  async createTask(
    @Body() input: CreateTaskInputDto,
  ): Promise<CreateTaskOutputDto> {
    return await this.createTaskUseCase.execute(input);
  }
}
