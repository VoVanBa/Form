import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { QuestionConditionService } from './question-condition.service';
import { Roles } from 'src/common/decorater/role.customize';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role-auth.guard';

@Controller('question-condition')
export class QuestionConditionController {
  constructor(
    private readonly questionConditionService: QuestionConditionService,
  ) {}

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':conditionId')
  async deleteCondition(
    @Param('conditionId') conditionId: number,
  ): Promise<void> {
    return this.questionConditionService.delete(conditionId);
  }
}
