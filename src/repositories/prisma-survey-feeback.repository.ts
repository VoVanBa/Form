import { name } from 'ejs';
import { Injectable } from '@nestjs/common';
import { CreatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/create.form.dto';
import { IsurveyFeedbackRepository } from './i-repositories/survey-feedback.repository';
import { UpdatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/update.form.dto';
import { PrismaService } from 'src/config/prisma.service';
import { FormStatus } from 'src/models/enums/FormStatus';
import { SurveyFeedback } from 'src/models/SurveyFeedback';
import { SurveyFeedbackType } from 'src/models/enums/SurveyFeedbackType';
import { Question } from 'src/models/Question';
import { QuestionOnMedia } from 'src/models/QuestionOnMedia';
import { AnswerOption } from 'src/models/AnswerOption';
import { AnswerOptionOnMedia } from 'src/models/AnswerOptionOnMedia';
import { Media } from 'src/models/Media';
import { BusinessQuestionConfiguration } from 'src/models/BusinessQuestionConfiguration';
import { console } from 'inspector';

@Injectable()
export class PrismasurveyFeedbackRepository
  implements IsurveyFeedbackRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async createsurveyFeedback(
    data: CreatesurveyFeedbackDto,
    businessId: number,
  ) {
    return await this.prisma.surveyFeedback.create({
      data: {
        ...data,
        businessId: businessId,
      },
    });
  }
  // async getsurveyFeedbackById(id: number): Promise<SurveyFeedback> {
  //   const surveyFeedback = await this.prisma.surveyFeedback.findUnique({
  //     where: { id },
  //     include: {
  //       questions: {
  //         where: { deletedAt: null },
  //         orderBy: { index: 'asc' },
  //         include: {
  //           questionOnMedia: {
  //             include: {
  //               media: true,
  //             },
  //           },
  //           answerOptions: {
  //             orderBy: { index: 'asc' },
  //             include: {
  //               answerOptionOnMedia: {
  //                 include: {
  //                   media: true,
  //                 },
  //               },
  //             },
  //           },
  //           businessQuestionConfiguration: true,
  //         },
  //       },
  //       business: true,
  //       businessSettings: {
  //         include: {
  //           formSetting: true,
  //           business: true,
  //           form: true,
  //         },
  //       },
  //       userFormResponses: {
  //         include: {
  //           responseOnQuestions: true,
  //           user: true,
  //         },
  //       },
  //       configurations: {
  //         include: {
  //           question: true,
  //         },
  //       },
  //       responses: {
  //         include: {
  //           question: true,
  //           answerOption: true,
  //           userResponse: true,
  //         },
  //       },
  //     },
  //   });

  //   return new SurveyFeedback({
  //     ...surveyFeedback,
  //     type: surveyFeedback.type as SurveyFeedbackType,
  //     status: surveyFeedback.status as FormStatus,
  //   });
  // }

  async getsurveyFeedbackById(id: number): Promise<any> {
    const surveyFeedback = await this.prisma.surveyFeedback.findUnique({
      where: { id },
      include: {
        questions: {
          where: { deletedAt: null },
          orderBy: { index: 'asc' },
          include: {
            questionOnMedia: {
              include: { media: true },
            },
            answerOptions: {
              orderBy: { index: 'asc' },
              include: {
                answerOptionOnMedia: {
                  include: { media: true },
                },
              },
            },
            businessQuestionConfiguration: true,
          },
        },
        business: true,
        businessSettings: {
          include: {
            formSetting: {
              include: {
                businessSurveyFeedbackSettings: true,
                formSettingTypes: true, // Include SettingTypes here
              },
            },
            business: true,
            form: true,
          },
        },
        // userFormResponses: {
        //   include: { responseOnQuestions: true, user: true },
        // },
        // configurations: {
        //   include: { question: true },
        // },
        // responses: {
        //   include: { question: true, answerOption: true, userResponse: true },
        // },
      },
    });

    console.log(surveyFeedback, 'surbeyfeddback');

    const data = SurveyFeedback.fromPrisma(surveyFeedback);
    return data;
  }

  async getAllsurveyFeedbacks(businessId: number): Promise<any> {
    const prismaData = await this.prisma.surveyFeedback.findMany({
      where: {
        businessId,
      },
    });
    return prismaData.map((data) => SurveyFeedback.fromPrisma(data));
  }

  async updatesurveyFeedback(id: number, data: UpdatesurveyFeedbackDto) {
    return await this.prisma.surveyFeedback.update({
      where: { id },
      data,
    });
  }
  async deletesurveyFeedback(id: number) {
    return this.prisma.surveyFeedback.delete({
      where: { id },
    });
  }
  async updateStatus(status: FormStatus, formId: number) {
    return this.prisma.surveyFeedback.update({
      where: {
        id: formId,
      },
      data: {
        status: status,
      },
    });
  }

  async updateSurveyallowAnonymous(formId: number, active: boolean) {
    return await this.prisma.surveyFeedback.update({
      where: {
        id: formId,
      },
      data: {
        allowAnonymous: active,
      },
    });
  }
}
